"""
==============================================================================
Servicio de Inteligencia Artificial - Google GenAI SDK (Gemini 3 Flash)
==============================================================================
Manejo de subida del archivo multimedia al File API de Google, espera activa de
procesamiento del video y generación estructurada con JSON Schema de los
momentos de mayor retención y viralidad para Shorts / Reels / TikToks.
"""

import os
import time
import json
import logging
from typing import List
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

from config import settings

logger = logging.getLogger("autoshorts.gemini")
logging.basicConfig(level=logging.INFO)


class ViralMoment(BaseModel):
    """
    Estructura de datos para cada momento viral detectado por Gemini.
    """
    start_time: float = Field(
        ...,
        description="Tiempo de inicio del clip en segundos (ej. 34.5 o 120.0). Debe durar entre 20 y 50 segundos."
    )
    end_time: float = Field(
        ...,
        description="Tiempo de finalización del clip en segundos. La duración total (end_time - start_time) debe estar entre 20 y 50 segundos."
    )
    titulo_corto: str = Field(
        ...,
        description="Gancho visual superior de alto impacto para el video. MÁXIMO 5 PALABRAS EN MAYÚSCULAS (ej: 'EL SECRETO MILLONARIO NO REVELADO')."
    )
    titulo: str = Field(
        ...,
        description="Título llamativo optimizado para YouTube Shorts, Reels y TikTok (con gancho emocional o curiosidad)."
    )
    descripcion: str = Field(
        ...,
        description="Descripción optimizada para el algoritmo con llamada a la acción y hashtags relevantes (#Shorts #Viral #Reels #TikTok)."
    )


class ViralMomentsResponse(BaseModel):
    """
    Contenedor de la lista de momentos seleccionados.
    """
    clips: List[ViralMoment] = Field(
        ...,
        description="Lista de los mejores momentos virales ordenados por potencial de retención de audiencia."
    )


class GeminiVideoAnalyzer:
    """
    Clase encargada de subir videos a Google GenAI, verificar su estado de indexación
    y ejecutar el prompt para extraer los segmentos virales en formato JSON estricto.
    """

    def __init__(self, api_key: str = None):
        key = api_key or settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        if not key:
            raise ValueError(
                "No se encontró GEMINI_API_KEY. Por favor configúrala en el archivo .env o en el entorno de Cloud Run."
            )
        # Inicializar el cliente oficial del nuevo SDK google-genai
        self.client = genai.Client(api_key=key)
        self.model_name = settings.GEMINI_MODEL

    def _wait_for_file_active(self, uploaded_file, max_wait_seconds: int = 300):
        """
        Espera a que el video termine de ser procesado por los servidores de Google
        y su estado pase a ACTIVE para poder ser analizado por el modelo.
        """
        start_time = time.time()
        logger.info(f"Esperando a que el video {uploaded_file.name} esté listo (ACTIVE)...")

        while time.time() - start_time < max_wait_seconds:
            file_info = self.client.files.get(name=uploaded_file.name)
            state = getattr(file_info, "state", None)

            # types.FileState.ACTIVE o valor string "ACTIVE"
            if str(state).endswith("ACTIVE") or state == "ACTIVE":
                logger.info(f"Video {uploaded_file.name} listo para inferencia.")
                return file_info
            elif str(state).endswith("FAILED") or state == "FAILED":
                raise RuntimeError(f"Error procesando video en Google File API: {file_info.error}")

            logger.info("El video se está codificando en Google Cloud... reintentando en 6s")
            time.sleep(6)

        raise TimeoutError("Tiempo de espera agotado mientras Google procesaba el video.")

    def find_viral_moments(self, video_path: str, clip_count: int = 3) -> List[ViralMoment]:
        """
        Sube el video local a Google File API, solicita a Gemini 3 Flash el análisis
        y retorna la lista de momentos con formato validado por Pydantic.
        """
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"No existe el archivo de video: {video_path}")

        logger.info(f"Subiendo archivo {video_path} al File API de Google...")
        uploaded_file = self.client.files.upload(file=video_path)

        try:
            # Esperar a que el video esté listo para consulta multimodal
            ready_file = self._wait_for_file_active(uploaded_file)

            prompt = f"""
Actúa como un Editor y Estratega de Contenido Viral de élite para TikTok, YouTube Shorts e Instagram Reels.
Analiza detenidamente tanto la pista de audio (diálogos, ritmo, inflexiones) como la pista visual de este video.

Tu objetivo es identificar exactamente los {clip_count} momentos con mayor potencial de retención y viralidad.

REGLAS ESTRICTAS PARA CADA CLIP:
1. DURACIÓN: Cada clip DEBE durar obligatoriamente entre 20 y 50 segundos. El punto de corte final debe tener sentido gramatical o narrativo (un remate o 'punchline', nunca cortar a mitad de una palabra).
2. GANCHO VISUAL SUPERIOR (titulo_corto):
   - MÁXIMO 5 PALABRAS.
   - OBLIGATORIAMENTE EN LETRAS MAYÚSCULAS.
   - Debe ser un gancho intrigante o provocador que capture al espectador en los primeros 2 segundos (Ejemplo: 'NUNCA HAGAS ESTO EN VIVO', 'EL ERROR QUE TE ARRUINA', 'CÓMO GANAR 10X MÁS').
3. TÍTULO PARA YOUTUBE (titulo):
   - Un título con gancho, emojis y palabras clave de alta curiosidad.
4. DESCRIPCIÓN (descripcion):
   - 2-3 oraciones persuasivas incitando a comentar + hashtags virales relevantes (#Shorts #Viral #Podcast #Reels).
5. FORMATO DE SALIDA:
   - Devuelve estrictamente un objeto JSON con la clave 'clips' que contenga una lista de {clip_count} objetos con los campos especificados.
"""

            logger.info(f"Ejecutando inferencia con {self.model_name}...")

            # Esquema JSON estructurado para garantizar respuesta sin alucinaciones
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[
                    ready_file,
                    prompt
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=ViralMomentsResponse,
                    temperature=0.3,
                )
            )

            response_text = response.text or "{}"
            logger.info(f"Respuesta recibida de Gemini. Parseando esquema JSON...")

            # Parsear y validar contra el modelo Pydantic
            data = json.loads(response_text)
            parsed_response = ViralMomentsResponse(**data)

            # Si por alguna razón devolvió más de los solicitados, acotar al número pedido
            selected_clips = parsed_response.clips[:clip_count]
            logger.info(f"Se extrajeron exitosamente {len(selected_clips)} clips virales.")
            return selected_clips

        finally:
            # Buena práctica: Limpiar el archivo subido en Google File API para liberar almacenamiento
            try:
                logger.info(f"Eliminando archivo temporal en Google Cloud File API: {uploaded_file.name}")
                self.client.files.delete(name=uploaded_file.name)
            except Exception as e:
                logger.warning(f"No se pudo eliminar el archivo temporal en Google File API: {e}")
