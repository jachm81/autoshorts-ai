"""
==============================================================================
API REST Principal - AutoShorts AI (FastAPI + Google Cloud Run)
==============================================================================
Endpoints para procesamiento de video, análisis con IA de Gemini, recorte 9:16,
subtítulos sincronizados y entrega de archivos multimedia para Vercel.
"""

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

# Configuración de CORS para permitir peticiones desde Vercel y entornos locales
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar ruta estática para servir videos y miniaturas directamente al navegador
app.mount("/static/media", StaticFiles(directory=str(settings.OUTPUT_DIR)), name="media")

# Instancia de procesador de video
video_processor = VideoProcessor()


@app.get("/api/health")
async def health_check():
    """
    Endpoint de verificación de salud para Google Cloud Run y Kubernetes.
    """
    return {
        "status": "healthy",
        "service": "AutoShorts AI Backend",
        "model": settings.GEMINI_MODEL,
        "whisper_model": settings.WHISPER_MODEL
    }


@app.post("/api/process-video")
async def process_video_endpoint(
    video: UploadFile = File(..., description="Archivo de video en formato .mp4 o .mov"),
    clip_count: int = Form(3, description="Cantidad de clips virales a generar: 1, 3 o 5"),
    hook_color: str = Form("#FFFF00", description="Color del gancho superior (#FFFF00, #FFFFFF, #00FF00, #00FFFF)"),
    font_family: str = Form("Liberation Sans Bold", description="Tipografía para el gancho superior"),
    subtitle_style: str = Form("netflix", description="Estilo de subtítulos: 'netflix' o 'word_by_word'")
):
    """
    Endpoint central:
    1. Recibe el video subido.
    2. Analiza los mejores momentos de retención con Gemini 3 Flash.
    3. Corta los subclips, transcribe con Whisper a bloques de máx 35 caracteres.
    4. Renderiza el video 9:16 con caja de subtítulo oscura tipo Netflix y gancho superior.
    5. Extrae miniaturas en el segundo 3 y retorna la lista completa para el frontend.
    """
    # Validar extensión del archivo
    filename = video.filename or "video.mp4"
    extension = Path(filename).suffix.lower()
    if extension not in [".mp4", ".mov", ".mkv", ".avi", ".webm"]:
        raise HTTPException(
            status_code=400,
            detail=f"Formato no compatible ({extension}). Por favor sube un archivo .mp4 o .mov."
        )

    # Validar número de clips
    if clip_count not in [1, 3, 5]:
        clip_count = 3

    # Generar identificador único de sesión
    session_id = uuid.uuid4().hex[:8]
    input_file_path = settings.UPLOAD_DIR / f"{session_id}_input{extension}"

    logger.info(f"Guardando archivo de video subido en: {input_file_path}")

    try:
        # Guardar archivo subido en disco
        with open(input_file_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)

        # 1. Analizar video con Gemini 3 Flash
        logger.info("Iniciando análisis viral con Gemini 3 Flash...")
        analyzer = GeminiVideoAnalyzer()
        viral_moments: List[ViralMoment] = analyzer.find_viral_moments(
            video_path=str(input_file_path),
            clip_count=clip_count
        )

        if not viral_moments:
            raise HTTPException(
                status_code=500,
                detail="Gemini no pudo identificar momentos virales adecuados en el video."
            )

        processed_clips = []

        # 2. Procesar cada momento identificado
        for index, moment in enumerate(viral_moments, start=1):
            clip_id = f"{session_id}_clip_{index}"
            raw_clip_path = settings.STORAGE_DIR / f"{clip_id}_raw.mp4"
            audio_path = settings.STORAGE_DIR / f"{clip_id}_audio.wav"
            ass_path = settings.SUBTITLES_DIR / f"{clip_id}_netflix.ass"
            thumb_path = settings.OUTPUT_DIR / f"{clip_id}_thumb.jpg"
            final_video_path = settings.OUTPUT_DIR / f"{clip_id}_9x16.mp4"

            logger.info(f"Procesando Clip #{index}: '{moment.titulo_corto}' ({moment.start_time}s - {moment.end_time}s)")

            # a) Extraer subclip exacto
            video_processor.extract_subclip(
                input_video=str(input_file_path),
                start_time=moment.start_time,
                end_time=moment.end_time,
                output_clip=str(raw_clip_path)
            )

            # b) Extraer miniatura limpia en el segundo 3 (sin subtítulos)
            video_processor.extract_clean_thumbnail(
                raw_clip_path=str(raw_clip_path),
                thumbnail_output_path=str(thumb_path)
            )

            # c) Extraer audio para transcripción
            video_processor.extract_audio(
                video_path=str(raw_clip_path),
                audio_path=str(audio_path)
            )

            # d) Generar subtítulos ASS estilo Netflix (caja semitransparente, máx 35 caracteres)
            video_processor.generate_netflix_ass_subtitles(
                audio_path=str(audio_path),
                ass_output_path=str(ass_path),
                style_mode=subtitle_style
            )

            # e) Renderizado final 9:16 con FFmpeg (recorte + drawtext gancho + ASS)
            video_processor.render_viral_short(
                raw_clip_path=str(raw_clip_path),
                ass_subtitles_path=str(ass_path),
                hook_title=moment.titulo_corto,
                output_video_path=str(final_video_path),
                hook_color=hook_color,
                font_family=font_family
            )

            # Limpiar archivos temporales intermedios para ahorrar espacio en disco
            for temp_file in [raw_clip_path, audio_path, ass_path]:
                if temp_file.exists():
                    try:
                        temp_file.unlink()
                    except Exception:
                        pass

            # URLs relativas para consumo desde el frontend
            processed_clips.append({
                "id": clip_id,
                "clip_number": index,
                "titulo_corto": moment.titulo_corto,
                "titulo": moment.titulo,
                "descripcion": moment.descripcion,
                "start_time": moment.start_time,
                "end_time": moment.end_time,
                "duration": round(moment.end_time - moment.start_time, 1),
                "video_url": f"/static/media/{final_video_path.name}",
                "thumbnail_url": f"/static/media/{thumb_path.name}",
                "download_url": f"/api/download/{final_video_path.name}",
                "filename": final_video_path.name
            })

        return {
            "status": "success",
            "message": f"Se generaron {len(processed_clips)} Shorts virales con éxito.",
            "clips": processed_clips
        }

    except Exception as e:
        logger.exception("Error durante el procesamiento del video")
        raise HTTPException(
            status_code=500,
            detail=f"Error procesando el video: {str(e)}"
        )
    finally:
        # Limpiar el video original subido para no saturar memoria en Cloud Run
        if input_file_path.exists():
            try:
                input_file_path.unlink()
            except Exception:
                pass


@app.get("/api/download/{filename}")
async def download_file(filename: str):
    """
    Endpoint para descargar el video generado o la miniatura con encabezados de descarga.
    """
    file_path = settings.OUTPUT_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="El archivo solicitado no existe o ya ha expirado.")

    media_type = "video/mp4" if filename.endswith(".mp4") else "image/jpeg"
    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=filename,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
