import os
from pathlib import Path
import sys
from typing import Optional
import logging

BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import settings
from services.youtube_service import YouTubeDownloader, YouTubeBotDetectionError
from services.video_service import VideoProcessor

logger = logging.getLogger("autoshorts.api")

app = FastAPI(title="AutoShorts AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/static/media", StaticFiles(directory=str(settings.OUTPUT_DIR)), name="media"
)

video_processor = VideoProcessor()


@app.get("/")
async def root():
    return {"status": "ok", "message": "AutoShorts AI Backend Operativo"}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/process-video")
async def process_video(
    file: Optional[UploadFile] = File(None),
    youtube_url: Optional[str] = Form(None),
    num_shorts: int = Form(1),
    top_hook_text: str = Form(""),
    font_style: str = Form("Arial Bold"),
    top_hook_color: str = Form("Amarillo"),
):
    session_id = "sess_" + os.urandom(4).hex()
    input_file_path: Optional[Path] = None

    try:
        if youtube_url and youtube_url.strip():
            downloader = YouTubeDownloader(output_dir=settings.OUTPUT_DIR)
            downloaded = downloader.download_video(youtube_url.strip(), session_id)
            input_file_path = Path(downloaded)
        elif file and file.filename:
            input_file_path = settings.OUTPUT_DIR / f"{session_id}_{file.filename}"
            with open(input_file_path, "wb") as buffer:
                buffer.write(await file.read())
        else:
            raise HTTPException(
                status_code=400,
                detail="Debes adjuntar un archivo de video o ingresar una URL de YouTube.",
            )

        return {
            "status": "processing",
            "task_id": session_id,
            "video_path": str(input_file_path),
            "message": "El procesamiento del video ha comenzado con éxito en el servidor.",
        }

    except YouTubeBotDetectionError as e:
        logger.warning(f"Bloqueo de bot interceptado limpiamente: {e}")
        raise HTTPException(
            status_code=422,
            detail={
                "status": "error",
                "error_type": "YOUTUBE_BOT_BLOCKED",
                "message": e.user_message,
                "suggestion": "Sube el archivo de video (.mp4) directamente para evitar la verificación de bot de Cloud Run.",
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error preparando el archivo de video: {e}")
        raise HTTPException(
            status_code=500,
            detail={"error_type": "SERVER_ERROR", "message": f"Error interno: {str(e)}"},
        )
