import os
from pathlib import Path
import sys
from typing import Optional

# ==============================================================================
# 1. Ajuste de sys.path (Garantiza la resolución de módulos sin ModuleNotFoundError)
# ==============================================================================
BACKEND_DIR = Path(__file__).resolve().parent
PARENT_DIR = BACKEND_DIR.parent

# Se inserta backend/ al inicio de sys.path para importaciones directas (ej: "import config")
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Se inserta la raíz al sys.path por compatibilidad
if str(PARENT_DIR) not in sys.path:
    sys.path.insert(1, str(PARENT_DIR))

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Importaciones directas (sin usar 'backend.' para evitar fallos de resolución)
from config import settings
from services.gemini_service import GeminiVideoAnalyzer
from services.video_service import VideoProcessor
from services.youtube_service import (
    YouTubeBotDetectionError,
    YouTubeDownloader,
    YouTubeError,
    YouTubeUnavailableError,
)

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

    # Control de excepciones específico (Evita el Error HTTP 500)
    except YouTubeBotDetectionError as e:
        raise HTTPException(
            status_code=422,
            detail={
                "status": "error",
                "error_type": e.error_type,
                "message": e.user_friendly_message,
                "suggestion": "Sube el archivo de video directamente para evitar la verificación de bot de Cloud Run.",
            },
        )
    except YouTubeUnavailableError as e:
        raise HTTPException(
            status_code=400,
            detail={
                "status": "error",
                "error_type": e.error_type,
                "message": e.user_friendly_message,
            },
        )
    except YouTubeError as e:
        raise HTTPException(
            status_code=400,
            detail={
                "status": "error",
                "error_type": e.error_type,
                "message": e.user_friendly_message,
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "message": f"Error interno en el servidor: {str(e)}",
            },
        )


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
