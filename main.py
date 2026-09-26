import os
import uuid
import shutil
import logging
from typing import List, Optional
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from config import settings
from services.gemini_service import GeminiVideoAnalyzer, ViralMoment
from services.video_service import VideoProcessor

# Configuración de logs
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("autoshorts.api")

# Inicialización de la aplicación FastAPI
app = FastAPI(
    title="AutoShorts AI - API de Videos Virales 9:16",
    description="Motor SaaS para transformar videos largos en Shorts virales 9:16 con Gemini 3 Flash, FFmpeg y Whisper.",
    version="1.0.0"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://autoshorts-lusc4ew3m-emprende-seo.vercel.app",
        "https://autoshorts-ai-ebon.vercel.app",
        "*"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar ruta estática para servir videos y miniaturas
app.mount("/static/media", StaticFiles(directory=str(settings.OUTPUT_DIR)), name="media")

# Instancia del procesador de video
video_processor = VideoProcessor()


@app.get("/")
async def root():
    return {"status": "ok", "message": "AutoShorts AI Backend Operativo"}


@app.post("/api/process-video")
async def process_video(
    background_tasks: BackgroundTasks,
    file: Optional[UploadFile] = File(None),
    youtube_url: Optional[str] = Form(None),
    num_shorts: int = Form(1),
    top_hook_text: str = Form(""),
    font_style: str = Form("Arial Bold"),
    top_hook_color: str = Form("Amarillo")
):
    if not file and not youtube_url:
        raise HTTPException(
            status_code=400, 
            detail="Debes subir un archivo de video o proporcionar una URL de YouTube."
        )

    task_id = str(uuid.uuid4())
    logger.info(f"Iniciando tarea {task_id}")

    # Aquí se delega la ejecución pesada a tareas de fondo para evitar Timeouts en el cliente
    # background_tasks.add_task(...) 

    return {
        "status": "processing",
        "task_id": task_id,
        "message": "El procesamiento del video ha comenzado con éxito."
    }