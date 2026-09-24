"""
==============================================================================
Servicio de Procesamiento de Video - FFmpeg + Whisper
==============================================================================
Módulo encargado de:
1. Extraer subclips precisos basados en las marcas de tiempo de Gemini.
2. Transcribir el audio con OpenAI Whisper a nivel de palabras y frases cortas.
3. Formatear subtítulos estilo "Netflix/Cine" con Advanced SubStation Alpha (.ass)
   usando cajas semitransparentes (BorderStyle=4, BackColour=&H80000000) y textwrap.
4. Renderizar el recorte 9:16 centrado (1080x1920) y quemar el gancho superior dinámico.
5. Extraer miniatura limpia (.jpg) en el segundo 3.
"""

import os
import subprocess
import logging
import textwrap
from pathlib import Path
from typing import Dict, Any, Optional

import whisper
from config import settings

logger = logging.getLogger("autoshorts.video")
logging.basicConfig(level=logging.INFO)

# Carga perezosa (lazy load) del modelo Whisper para ahorrar memoria RAM en el arranque
_whisper_model = None

def get_whisper_model():
    """
    Obtiene o inicializa el modelo Whisper en memoria RAM.
    """
    global _whisper_model
    if _whisper_model is None:
        logger.info(f"Cargando modelo de Whisper '{settings.WHISPER_MODEL}'...")
        _whisper_model = whisper.load_model(settings.WHISPER_MODEL)
    return _whisper_model


def seconds_to_ass_time(seconds: float) -> str:
    """
    Convierte segundos en formato de tiempo ASS: H:MM:SS.cs (centésimas de segundo)
    Ejemplo: 65.42 -> 0:01:05.42
    """
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = seconds % 60
    return f"{hours}:{minutes:02d}:{secs:05.2f}"


def escape_ffmpeg_text(text: str) -> str:
    """
    Escapa caracteres especiales para el filtro drawtext de FFmpeg.
    Caracteres como ':', '%', '\\', '\'' deben ser protegidos.
    """
    escaped = text.replace('\\', '\\\\')
    escaped = escaped.replace("'", "'\\\\\\''")
    escaped = escaped.replace(':', '\\:')
    escaped = escaped.replace('%', '\\%')
    return escaped


class VideoProcessor:
    """
    Clase central para corte, transcripción, generación de subtítulos y renderizado 9:16.
    """

    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        self.output_dir = settings.OUTPUT_DIR
        self.subtitles_dir = settings.SUBTITLES_DIR

    def extract_subclip(self, input_video: str, start_time: float, end_time: float, output_clip: str) -> str:
        """
        Extrae el fragmento seleccionado del video original con recodificación rápida.
        """
        duration = end_time - start_time
        logger.info(f"Extrayendo clip desde {start_time}s hasta {end_time}s (duración: {duration}s)...")

        cmd = [
            "ffmpeg",
            "-y",
            "-ss", str(start_time),
            "-i", input_video,
            "-t", str(duration),
            "-c:v", "libx264",
            "-c:a", "aac",
            "-b:a", "192k",
            "-preset", "veryfast",
            output_clip
        ]

        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if result.returncode != 0:
            logger.error(f"Error extrayendo subclip: {result.stderr}")
            raise RuntimeError(f"Fallo en FFmpeg al extraer subclip: {result.stderr}")

        return output_clip

    def extract_audio(self, video_path: str, audio_path: str) -> str:
        """
        Extrae la pista de audio a 16kHz mono para optimizar el análisis con Whisper.
        """
        logger.info(f"Extrayendo pista de audio a {audio_path}...")
        cmd = [
            "ffmpeg",
            "-y",
            "-i", video_path,
            "-vn",
            "-acodec", "pcm_s16le",
            "-ar", "16000",
            "-ac", "1",
            audio_path
        ]
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if result.returncode != 0:
            raise RuntimeError(f"Fallo al extraer audio del video: {result.stderr}")
        return audio_path

    def generate_netflix_ass_subtitles(
        self,
        audio_path: str,
        ass_output_path: str,
        style_mode: str = "netflix"
    ) -> str:
        """
        Transcribe el audio con Whisper y genera un archivo de subtítulos ASS
        con el estilo visual característico de Netflix/Cine:
        - Frases acotadas con textwrap (máximo 35 caracteres por bloque).
        - Caja oscura semitransparente (BorderStyle=4, BackColour=&H80000000).
        - Letra blanca nítida, centrada inferiormente, tapando subtítulos nativos.
        """
        model = get_whisper_model()
        logger.info(f"Transcribiendo audio {audio_path} con Whisper...")
        transcription = model.transcribe(audio_path, verbose=False)

        segments = transcription.get("segments", [])
        logger.info(f"Se identificaron {len(segments)} segmentos de diálogo.")

        # Configuración del encabezado ASS (Advanced SubStation Alpha)
        # PlayResX: 1080, PlayResY: 1920 (Canvas nativo vertical 9:16)
        # Style Netflix: Font Arial/Liberation Sans, Size 54, Bold, Alignment 2 (Bottom Center)
        # BorderStyle 4 = Opaque Box (caja de fondo)
        # BackColour = &H80000000 (Negro con 50% de opacidad para tapar cualquier texto previo)
        ass_header = """[Script Info]
Title: AutoShorts Netflix Cine Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Netflix,Arial,52,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,1,0,4,0,0,2,40,40,240,1
Style: WordByWord,Arial,56,&H0000FFFF,&H000000FF,&H00000000,&HA0000000,-1,0,0,0,100,100,1,0,4,0,0,2,40,40,240,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

        events = []
        selected_style = "WordByWord" if style_mode == "word_by_word" else "Netflix"

        for seg in segments:
            seg_start = seg.get("start", 0.0)
            seg_end = seg.get("end", 0.0)
            seg_text = seg.get("text", "").strip()

            if not seg_text:
                continue

            # Usar textwrap para limitar cada bloque a un máximo de 35 caracteres
            # Esto produce fragmentos de 3 a 5 palabras, garantizando ritmo visual dinámico
            wrap_width = 25 if style_mode == "word_by_word" else 35
            lines = textwrap.wrap(seg_text, width=wrap_width)
            if not lines:
                continue

            # Distribuir el tiempo del segmento proporcionalmente a la longitud de cada línea
            total_chars = max(len(seg_text), 1)
            seg_duration = max(seg_end - seg_start, 0.4)
            current_start = seg_start

            for line in lines:
                line_duration = (len(line) / total_chars) * seg_duration
                line_end = current_start + line_duration

                start_formatted = seconds_to_ass_time(current_start)
                end_formatted = seconds_to_ass_time(line_end)

                # Limpiar texto de comillas o saltos
                clean_line = line.replace("\n", " ").strip()
                events.append(
                    f"Dialogue: 0,{start_formatted},{end_formatted},{selected_style},,0,0,0,,{clean_line}"
                )
                current_start = line_end

        # Escribir el archivo ASS final
        with open(ass_output_path, "w", encoding="utf-8") as f:
            f.write(ass_header)
            f.write("\n".join(events))
            f.write("\n")

        logger.info(f"Archivo de subtítulos ASS generado en {ass_output_path} con {len(events)} líneas.")
        return ass_output_path

    def extract_clean_thumbnail(self, raw_clip_path: str, thumbnail_output_path: str) -> str:
        """
        Extrae una captura limpia (.jpg) en el segundo 3 del clip ANTES de quemar
        subtítulos para su uso como miniatura atractiva y profesional.
        """
        logger.info(f"Generando miniatura limpia en {thumbnail_output_path}...")
        cmd = [
            "ffmpeg",
            "-y",
            "-ss", "3",
            "-i", raw_clip_path,
            "-vframes", "1",
            "-q:v", "2",
            "-vf", "crop=ih*(9/16):ih:(in_w-out_w)/2:0,scale=1080:1920",
            thumbnail_output_path
        ]
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if result.returncode != 0 or not os.path.exists(thumbnail_output_path):
            # Fallback al segundo 1 si el video es muy corto
            fallback_cmd = [
                "ffmpeg",
                "-y",
                "-ss", "1",
                "-i", raw_clip_path,
                "-vframes", "1",
                "-q:v", "2",
                "-vf", "crop=ih*(9/16):ih:(in_w-out_w)/2:0,scale=1080:1920",
                thumbnail_output_path
            ]
            subprocess.run(fallback_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

        return thumbnail_output_path

    def render_viral_short(
        self,
        raw_clip_path: str,
        ass_subtitles_path: str,
        hook_title: str,
        output_video_path: str,
        hook_color: str = "#FFFF00",
        font_family: str = "Liberation Sans Bold"
    ) -> str:
        """
        Aplica la cadena completa de filtros FFmpeg:
        1. Recorte a 9:16 centrado: crop=ih*(9/16):ih:(in_w-out_w)/2:0,scale=1080:1920
        2. Inyección dinámica del Gancho Superior con drawtext (Color y Fuente configurables)
        3. Superposición de subtítulos ASS tipo Netflix con caja oscura
        """
        logger.info(f"Iniciando renderizado final 9:16 con FFmpeg en {output_video_path}...")

        # Resolver la ruta de la fuente TrueType
        font_path = settings.FONTS_MAP.get(font_family, settings.DEFAULT_FONT_PATH)
        if not os.path.exists(font_path):
            font_path = settings.DEFAULT_FONT_PATH

        # Escapar el gancho de texto
        escaped_hook = escape_ffmpeg_text(hook_title.strip().upper())
        escaped_ass = ass_subtitles_path.replace("\\", "/").replace(":", "\\:")

        # Filtro de recorte 9:16 centrado estándar solicitado
        crop_scale_filter = "crop=ih*(9/16):ih:(in_w-out_w)/2:0,scale=1080:1920"

        # Filtro drawtext para el gancho superior:
        # - Posición Y: 180 píxeles desde el borde superior
        # - Centrado horizontal: x=(w-text_w)/2
        # - Caja de fondo negra semitransparente con borde acolchado para máxima legibilidad
        # - Contorno de texto negro grueso (borderw=3)
        drawtext_filter = (
            f"drawtext="
            f"fontfile='{font_path}':"
            f"text='{escaped_hook}':"
            f"fontsize=54:"
            f"fontcolor={hook_color}:"
            f"borderw=4:"
            f"bordercolor=black:"
            f"box=1:"
            f"boxcolor=black@0.75:"
            f"boxborderw=18:"
            f"x=(w-text_w)/2:"
            f"y=180"
        )

        # Filtro ASS para subtítulos tipo Netflix
        subtitles_filter = f"ass='{escaped_ass}'"

        # Encadenar todos los filtros de video
        filter_complex = f"{crop_scale_filter},{drawtext_filter},{subtitles_filter}"

        cmd = [
            "ffmpeg",
            "-y",
            "-i", raw_clip_path,
            "-vf", filter_complex,
            "-c:v", "libx264",
            "-preset", "faster",
            "-crf", "22",
            "-c:a", "aac",
            "-b:a", "192k",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            output_video_path
        ]

        logger.info("Ejecutando comando FFmpeg...")
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

        if result.returncode != 0:
            logger.error(f"Fallo en renderizado FFmpeg: {result.stderr}")
            # Si el filtro ASS falla por falta de soporte de libass en un entorno local mínimo,
            # ejecutamos un fallback sólo con recorte y gancho
            fallback_filter = f"{crop_scale_filter},{drawtext_filter}"
            fallback_cmd = [
                "ffmpeg",
                "-y",
                "-i", raw_clip_path,
                "-vf", fallback_filter,
                "-c:v", "libx264",
                "-preset", "ultrafast",
                "-c:a", "aac",
                output_video_path
            ]
            fallback_res = subprocess.run(fallback_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if fallback_res.returncode != 0:
                raise RuntimeError(f"Error crítico en FFmpeg: {result.stderr}")

        logger.info(f"Video 9:16 generado con éxito en: {output_video_path}")
        return output_video_path
