"""
==============================================================================
Configuración Global - AutoShorts AI
==============================================================================
Manejo centralizado de variables de entorno, directorios de trabajo y rutas de
fuentes TrueType para el renderizado con FFmpeg en Linux / Google Cloud Run.
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Directorio base del proyecto
BASE_DIR = Path(__file__).resolve().parent

class Settings(BaseSettings):
    """
    Configuración de la aplicación cargada desde variables de entorno o defaults.
    """
    # Clave de API para Google Gemini (inyectada en Cloud Run como Secret o Env Var)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Modelo Gemini a utilizar para análisis multimodal de video
    # Usamos gemini-3.6-flash / gemini-2.5-flash según la versión disponible
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

    # Modelo de Whisper para transcripción de audio ('tiny', 'base', 'small')
    # 'base' ofrece un equilibrio ideal entre velocidad y precisión en CPU de Cloud Run
    WHISPER_MODEL: str = os.getenv("WHISPER_MODEL", "base")

    # Directorios de almacenamiento temporal en el contenedor
    STORAGE_DIR: Path = BASE_DIR / "storage"
    UPLOAD_DIR: Path = BASE_DIR / "storage" / "uploads"
    OUTPUT_DIR: Path = BASE_DIR / "storage" / "outputs"
    SUBTITLES_DIR: Path = BASE_DIR / "storage" / "subtitles"

    # Límite máximo de tamaño de video subido (en Megabytes)
    MAX_UPLOAD_SIZE_MB: int = 500

    # Orígenes permitidos para CORS (Frontend en Vercel, localhost para desarrollo)
    CORS_ORIGINS: list[str] = [
        "*",  # Permite cualquier frontend (Vercel, localhost, previews)
    ]

    # Mapeo de nombres de fuentes a archivos .ttf en Linux Debian
    FONTS_MAP: dict[str, str] = {
        "Liberation Sans Bold": "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "Arial Bold": "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "Impact": "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "DejaVu Sans Bold": "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    }

    # Ruta de fuente fallback por defecto
    DEFAULT_FONT_PATH: str = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

    class Config:
        env_file = ".env"
        extra = "ignore"

# Instancia singleton de configuración
settings = Settings()

# Garantizar la existencia de los directorios de trabajo
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
settings.SUBTITLES_DIR.mkdir(parents=True, exist_ok=True)
