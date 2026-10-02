import logging
import os
from pathlib import Path
import shutil
from typing import List, Optional
import uuid

from config import settings
from fastapi import BackgroundTasks, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from services.gemini_service import GeminiVideoAnalyzer, ViralMoment
from services.video_service import VideoProcessor
import yt_dlp

# Configuración de logs
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("autoshorts.api")

# Inicialización de FastAPI
app = FastAPI(
    title="AutoShorts AI - API de Videos Virales 9:16",
    description=(
        "Motor SaaS para transformar videos largos en Shorts virales 9:16"
        " con Gemini 3 Flash, FFmpeg y Whisper."
    ),
    version="1.0.0",
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar ruta estática para servir los videos procesados
app.mount(
    "/static/media", StaticFiles(directory=str(settings.OUTPUT_DIR)), name="media"
)

# Instancia del procesador de video
video_processor = VideoProcessor()


def download_youtube_video(youtube_url: str, output_dir: Path) -> Path:
    """Descarga un video de YouTube utilizando yt-dlp evitando la detección de bots."""
    output_template = str(output_dir / "%(id)s.%(ext)s")
    ydl_opts = {
        "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "outtmpl": output_template,
        "quiet": True,
        "no_warnings": True,
        # BYPASS PARA EVITAR EL ERROR "Sign in to confirm you're not a bot" EN CLOUD RUN:
        "extractor_args": {
            "youtube": {
                "player_client": ["android", "ios"]
            }
        }
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(youtube_url, download=True)
        filename = ydl.prepare_filename(info)
        return Path(filename)


@app.get("/")
async def root():
    return {"status": "ok", "message": "AutoShorts AI Backend Operativo"}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/process-video")
async def process_video(
    background_tasks: BackgroundTasks,
    file: Optional[UploadFile] = File(None),
    youtube_url: Optional[str] = Form(None),
    num_shorts: int = Form(1),
    top_hook_text: str = Form(""),
    font_style: str = Form("Arial Bold"),
    top_hook_color: str = Form("Amarillo"),
):
    if not file and not youtube_url:
        raise HTTPException(
            status_code=400,
            detail="Debes subir un archivo de video o proporcionar una URL de YouTube.",
        )

    task_id = str(uuid.uuid4())
    logger.info(f"Iniciando tarea {task_id}")

    video_path = None

    try:
        if youtube_url and youtube_url.strip():
            logger.info(f"Descargando video desde URL de YouTube: {youtube_url}")
            video_path = download_youtube_video(
                youtube_url.strip(), settings.OUTPUT_DIR
            )
        elif file:
            temp_file_path = settings.OUTPUT_DIR / f"{task_id}_{file.filename}"
            with open(temp_file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            video_path = temp_file_path
    except Exception as e:
        logger.error(f"Error preparando el archivo de video: {e}")
        raise HTTPException(
            status_code=500, detail=f"No se pudo obtener el video: {str(e)}"
        )

    return {
        "status": "processing",
        "task_id": task_id,
        "video_path": str(video_path),
        "message": "El procesamiento del video ha comenzado con éxito en el servidor.",
    }
