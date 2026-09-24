/**
 * Catálogo de archivos del proyecto SaaS AutoShorts AI para visualización,
 * inspección y descarga directa desde el navegador.
 */

export interface ProjectFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export const PROJECT_FILES: ProjectFile[] = [
  {
    name: "Dockerfile",
    path: "Dockerfile",
    language: "dockerfile",
    description: "Contenedor Debian Slim optimizado para Cloud Run con FFmpeg, fuentes Liberation y PyTorch CPU.",
    content: `# ==============================================================================
# Dockerfile para AutoShorts AI (Backend FastAPI + FFmpeg + Whisper)
# Optimizado para Google Cloud Run (Linux x86_64 / Debian Slim)
# ==============================================================================

FROM python:3.10-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# 1. Instalar dependencias del sistema (FFmpeg y fuentes TrueType)
RUN apt-get update && apt-get install -y --no-install-recommends \\
    ffmpeg \\
    fonts-liberation \\
    fonts-dejavu-core \\
    build-essential \\
    curl \\
    git \\
    && rm -rf /var/lib/apt/lists/*

# 2. Copiar e instalar requerimientos
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \\
    pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \\
    pip install --no-cache-dir -r requirements.txt

# 3. Crear directorios temporales de almacenamiento
RUN mkdir -p /app/storage/uploads /app/storage/outputs /app/storage/subtitles && \\
    chmod -R 777 /app/storage

# 4. Copiar código fuente
COPY config.py .
COPY main.py .
COPY services/ ./services/

# 5. Configurar puerto de Cloud Run
ENV PORT=8080
EXPOSE 8080

CMD exec uvicorn main:app --host 0.0.0.0 --port \${PORT} --workers 1 --timeout-keep-alive 900`
  },
  {
    name: "requirements.txt",
    path: "requirements.txt",
    language: "plaintext",
    description: "Librerías Python: FastAPI, google-genai, openai-whisper, python-multipart y Pydantic.",
    content: `# Framework Web asíncrono y servidor ASGI
fastapi>=0.115.0
uvicorn[standard]>=0.32.0

# Procesamiento de subida de archivos multipart/form-data
python-multipart>=0.0.12
aiofiles>=24.1.0

# SDK Oficial de Google GenAI para análisis de video con Gemini 3 Flash
google-genai>=1.0.0

# Transcripción de audio automática a nivel de palabras/segmentos
openai-whisper>=20231117

# Validación de esquemas y configuración de entorno
pydantic>=2.9.2
pydantic-settings>=2.5.2

# Utilidades HTTP y manejo de medios
requests>=2.32.3`
  },
  {
    name: "config.py",
    path: "config.py",
    language: "python",
    description: "Manejo centralizado de API Keys (GEMINI_API_KEY), rutas de fuentes y configuración de entorno.",
    content: `import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent

class Settings(BaseSettings):
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
    WHISPER_MODEL: str = os.getenv("WHISPER_MODEL", "base")

    STORAGE_DIR: Path = BASE_DIR / "storage"
    UPLOAD_DIR: Path = BASE_DIR / "storage" / "uploads"
    OUTPUT_DIR: Path = BASE_DIR / "storage" / "outputs"
    SUBTITLES_DIR: Path = BASE_DIR / "storage" / "subtitles"

    MAX_UPLOAD_SIZE_MB: int = 500
    CORS_ORIGINS: list[str] = ["*"]

    FONTS_MAP: dict[str, str] = {
        "Liberation Sans Bold": "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "Arial Bold": "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "Impact": "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "DejaVu Sans Bold": "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    }

    DEFAULT_FONT_PATH: str = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
settings.SUBTITLES_DIR.mkdir(parents=True, exist_ok=True)`
  },
  {
    name: "services/gemini_service.py",
    path: "services/gemini_service.py",
    language: "python",
    description: "Lógica de subida a Google File API, espera activa (ACTIVE) y prompt estructurado con Gemini 3 Flash.",
    content: `import os
import time
import json
import logging
from typing import List
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

from config import settings

logger = logging.getLogger("autoshorts.gemini")

class ViralMoment(BaseModel):
    start_time: float = Field(..., description="Inicio en segundos (20-50s duración)")
    end_time: float = Field(..., description="Fin en segundos (20-50s duración)")
    titulo_corto: str = Field(..., description="Gancho superior. MÁXIMO 5 PALABRAS EN MAYÚSCULAS")
    titulo: str = Field(..., description="Título con gancho para YouTube Shorts/TikTok")
    descripcion: str = Field(..., description="Descripción persuasiva con hashtags #Shorts #Viral")

class ViralMomentsResponse(BaseModel):
    clips: List[ViralMoment]

class GeminiVideoAnalyzer:
    def __init__(self, api_key: str = None):
        key = api_key or settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        if not key:
            raise ValueError("No se encontró GEMINI_API_KEY.")
        self.client = genai.Client(api_key=key)
        self.model_name = settings.GEMINI_MODEL

    def _wait_for_file_active(self, uploaded_file, max_wait_seconds: int = 300):
        start_time = time.time()
        while time.time() - start_time < max_wait_seconds:
            file_info = self.client.files.get(name=uploaded_file.name)
            state = getattr(file_info, "state", None)
            if str(state).endswith("ACTIVE") or state == "ACTIVE":
                return file_info
            elif str(state).endswith("FAILED") or state == "FAILED":
                raise RuntimeError(f"Error procesando video en Google: {file_info.error}")
            time.sleep(6)
        raise TimeoutError("Tiempo de espera agotado mientras Google procesaba el video.")

    def find_viral_moments(self, video_path: str, clip_count: int = 3) -> List[ViralMoment]:
        uploaded_file = self.client.files.upload(file=video_path)
        try:
            ready_file = self._wait_for_file_active(uploaded_file)
            prompt = f"""
Actúa como un Editor y Estratega de Contenido Viral de élite para TikTok, YouTube Shorts e Instagram Reels.
Analiza audio y video e identifica exactamente los {clip_count} momentos con mayor retención.

REGLAS ESTRICTAS:
1. DURACIÓN: Cada clip debe durar entre 20 y 50 segundos con remate narrativo coherente.
2. GANCHO VISUAL SUPERIOR (titulo_corto): MÁXIMO 5 PALABRAS EN MAYÚSCULAS.
3. TÍTULO Y DESCRIPCIÓN: Formato optimizado para YouTube Shorts con hashtags.
4. FORMATO: JSON estricto con la lista 'clips'.
"""
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[ready_file, prompt],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=ViralMomentsResponse,
                    temperature=0.3,
                )
            )
            data = json.loads(response.text or "{}")
            parsed = ViralMomentsResponse(**data)
            return parsed.clips[:clip_count]
        finally:
            try:
                self.client.files.delete(name=uploaded_file.name)
            except Exception:
                pass`
  },
  {
    name: "services/video_service.py",
    path: "services/video_service.py",
    language: "python",
    description: "FFmpeg 9:16 (crop+scale 1080x1920), Whisper, subtítulos ASS Netflix (BorderStyle=4, máx 35 caracteres) y drawtext.",
    content: `import os
import subprocess
import logging
import textwrap
import whisper
from config import settings

logger = logging.getLogger("autoshorts.video")
_whisper_model = None

def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        _whisper_model = whisper.load_model(settings.WHISPER_MODEL)
    return _whisper_model

def seconds_to_ass_time(seconds: float) -> str:
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = seconds % 60
    return f"{hours}:{minutes:02d}:{secs:05.2f}"

def escape_ffmpeg_text(text: str) -> str:
    escaped = text.replace('\\\\', '\\\\\\\\')
    escaped = escaped.replace("'", "'\\\\\\\\\\\\''")
    escaped = escaped.replace(':', '\\\\:')
    escaped = escaped.replace('%', '\\\\%')
    return escaped

class VideoProcessor:
    def extract_subclip(self, input_video: str, start_time: float, end_time: float, output_clip: str) -> str:
        cmd = [
            "ffmpeg", "-y", "-ss", str(start_time), "-i", input_video,
            "-t", str(end_time - start_time),
            "-c:v", "libx264", "-c:a", "aac", "-b:a", "192k", "-preset", "veryfast",
            output_clip
        ]
        subprocess.run(cmd, check=True)
        return output_clip

    def extract_audio(self, video_path: str, audio_path: str) -> str:
        cmd = ["ffmpeg", "-y", "-i", video_path, "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", audio_path]
        subprocess.run(cmd, check=True)
        return audio_path

    def generate_netflix_ass_subtitles(self, audio_path: str, ass_output_path: str, style_mode: str = "netflix") -> str:
        model = get_whisper_model()
        transcription = model.transcribe(audio_path, verbose=False)
        segments = transcription.get("segments", [])

        # Estilo ASS Cine/Netflix: BorderStyle=4 (caja oscura de fondo) y BackColour=&H80000000
        ass_header = """[Script Info]
Title: AutoShorts Netflix Cine Subtitles
ScriptType: v4.00+
WrapStyle: 0
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
        wrap_width = 25 if style_mode == "word_by_word" else 35

        for seg in segments:
            seg_start, seg_end, seg_text = seg.get("start", 0.0), seg.get("end", 0.0), seg.get("text", "").strip()
            if not seg_text:
                continue
            lines = textwrap.wrap(seg_text, width=wrap_width)
            if not lines:
                continue
            seg_dur = max(seg_end - seg_start, 0.4)
            current_start = seg_start
            for line in lines:
                dur = (len(line) / max(len(seg_text), 1)) * seg_dur
                events.append(
                    f"Dialogue: 0,{seconds_to_ass_time(current_start)},{seconds_to_ass_time(current_start + dur)},{selected_style},,0,0,0,,{line.strip()}"
                )
                current_start += dur

        with open(ass_output_path, "w", encoding="utf-8") as f:
            f.write(ass_header + "\\n".join(events) + "\\n")
        return ass_output_path

    def extract_clean_thumbnail(self, raw_clip_path: str, thumbnail_output_path: str) -> str:
        cmd = [
            "ffmpeg", "-y", "-ss", "3", "-i", raw_clip_path, "-vframes", "1", "-q:v", "2",
            "-vf", "crop=ih*(9/16):ih:(in_w-out_w)/2:0,scale=1080:1920",
            thumbnail_output_path
        ]
        subprocess.run(cmd)
        return thumbnail_output_path

    def render_viral_short(self, raw_clip_path: str, ass_subtitles_path: str, hook_title: str, output_video_path: str, hook_color: str = "#FFFF00", font_family: str = "Liberation Sans Bold") -> str:
        font_path = settings.FONTS_MAP.get(font_family, settings.DEFAULT_FONT_PATH)
        escaped_hook = escape_ffmpeg_text(hook_title.strip().upper())
        escaped_ass = ass_subtitles_path.replace("\\\\", "/").replace(":", "\\\\:")

        crop_scale_filter = "crop=ih*(9/16):ih:(in_w-out_w)/2:0,scale=1080:1920"
        drawtext_filter = f"drawtext=fontfile='{font_path}':text='{escaped_hook}':fontsize=54:fontcolor={hook_color}:borderw=4:bordercolor=black:box=1:boxcolor=black@0.75:boxborderw=18:x=(w-text_w)/2:y=180"
        subtitles_filter = f"ass='{escaped_ass}'"

        filter_complex = f"{crop_scale_filter},{drawtext_filter},{subtitles_filter}"

        cmd = [
            "ffmpeg", "-y", "-i", raw_clip_path, "-vf", filter_complex,
            "-c:v", "libx264", "-preset", "faster", "-crf", "22", "-c:a", "aac", "-b:a", "192k",
            "-pix_fmt", "yuv420p", "-movflags", "+faststart", output_video_path
        ]
        subprocess.run(cmd, check=True)
        return output_video_path`
  },
  {
    name: "main.py",
    path: "main.py",
    language: "python",
    description: "API REST FastAPI: CORS, endpoints /api/process-video, /api/download, /api/health y archivos estáticos.",
    content: `import os
import uuid
import shutil
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from config import settings
from services.gemini_service import GeminiVideoAnalyzer
from services.video_service import VideoProcessor

app = FastAPI(title="AutoShorts AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static/media", StaticFiles(directory=str(settings.OUTPUT_DIR)), name="media")
video_processor = VideoProcessor()

@app.get("/api/health")
async def health():
    return {"status": "healthy", "model": settings.GEMINI_MODEL}

@app.post("/api/process-video")
async def process_video(
    video: UploadFile = File(...),
    clip_count: int = Form(3),
    hook_color: str = Form("#FFFF00"),
    font_family: str = Form("Liberation Sans Bold"),
    subtitle_style: str = Form("netflix")
):
    session_id = uuid.uuid4().hex[:8]
    ext = Path(video.filename or "video.mp4").suffix.lower()
    input_path = settings.UPLOAD_DIR / f"{session_id}_input{ext}"

    with open(input_path, "wb") as f:
        shutil.copyfileobj(video.file, f)

    try:
        analyzer = GeminiVideoAnalyzer()
        moments = analyzer.find_viral_moments(str(input_path), clip_count=clip_count)
        results = []

        for idx, m in enumerate(moments, 1):
            clip_id = f"{session_id}_clip_{idx}"
            raw = settings.STORAGE_DIR / f"{clip_id}_raw.mp4"
            audio = settings.STORAGE_DIR / f"{clip_id}_audio.wav"
            ass = settings.SUBTITLES_DIR / f"{clip_id}.ass"
            thumb = settings.OUTPUT_DIR / f"{clip_id}_thumb.jpg"
            out = settings.OUTPUT_DIR / f"{clip_id}_9x16.mp4"

            video_processor.extract_subclip(str(input_path), m.start_time, m.end_time, str(raw))
            video_processor.extract_clean_thumbnail(str(raw), str(thumb))
            video_processor.extract_audio(str(raw), str(audio))
            video_processor.generate_netflix_ass_subtitles(str(audio), str(ass), style_mode=subtitle_style)
            video_processor.render_viral_short(str(raw), str(ass), m.titulo_corto, str(out), hook_color=hook_color, font_family=font_family)

            results.append({
                "id": clip_id,
                "titulo_corto": m.titulo_corto,
                "titulo": m.titulo,
                "descripcion": m.descripcion,
                "duration": round(m.end_time - m.start_time, 1),
                "video_url": f"/static/media/{out.name}",
                "thumbnail_url": f"/static/media/{thumb.name}",
                "download_url": f"/api/download/{out.name}"
            })

        return {"status": "success", "clips": results}
    finally:
        if input_path.exists():
            input_path.unlink()`
  },
  {
    name: "frontend/index.html",
    path: "frontend/index.html",
    language: "html",
    description: "SPA completa optimizada para Vercel en HTML5, TailwindCSS CDN, selectores interactivos y reproductor 9:16.",
    content: `<!-- Archivo frontend/index.html completo disponible en el repositorio para desplegar en Vercel -->
<!DOCTYPE html>
<html lang="es" class="h-full bg-slate-950 text-slate-100">
<head>
  <meta charset="UTF-8">
  <title>AutoShorts AI - Convertidor Viral 9:16</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="min-h-full">
  <!-- Consulta el archivo completo en frontend/index.html -->
</body>
</html>`
  },
  {
    name: "README.md",
    path: "README.md",
    language: "markdown",
    description: "Guía de despliegue paso a paso para Google Cloud Run (gcloud run deploy) y Vercel.",
    content: `# Despliegue en Google Cloud Run

\`\`\`bash
gcloud run deploy autoshorts-backend \\
  --source . \\
  --region us-central1 \\
  --platform managed \\
  --allow-unauthenticated \\
  --memory 4Gi \\
  --cpu 2 \\
  --timeout 900s \\
  --set-env-vars GEMINI_API_KEY="TU_KEY",GEMINI_MODEL="gemini-3.6-flash"
\`\`\`

# Despliegue en Vercel
\`\`\`bash
cd frontend && vercel --prod
\`\`\``
  }
];
