# ==============================================================================
# Dockerfile para AutoShorts AI (Backend FastAPI + FFmpeg + Whisper)
# Optimizado para Google Cloud Run (Linux x86_64 / Debian Slim)
# ==============================================================================

FROM python:3.10-slim

# Evitar prompts interactivos durante la instalación de paquetes
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Directorio de trabajo en el contenedor
WORKDIR /app

# 1. Instalar dependencias del sistema operativo:
#    - ffmpeg: Motor multimedia para corte 9:16, filtros drawtext y subtítulos
#    - fonts-liberation: Fuentes TrueType libres compatibles con Arial/Impact
#    - fonts-dejavu-core: Fuentes complementarias de alta legibilidad
#    - build-essential & git: Requeridos para compilar extensiones si son necesarias
#    - curl: Para pruebas de salud (Health Checks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    fonts-liberation \
    fonts-dejavu-core \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# 2. Copiar e instalar dependencias de Python
COPY requirements.txt .

# Actualizar pip e instalar paquetes de Python (usando PyTorch CPU para optimizar tamaño en Cloud Run)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# 3. Crear directorios temporales de almacenamiento con permisos adecuados
RUN mkdir -p /app/storage/uploads /app/storage/outputs /app/storage/subtitles && \
    chmod -R 777 /app/storage

# 4. Copiar el código fuente de la aplicación
COPY config.py .
COPY main.py .
COPY services/ ./services/

# 5. Configurar el puerto estándar de Google Cloud Run (inyectado como variable de entorno PORT)
ENV PORT=8080
EXPOSE 8080

# 6. Comando de inicio optimizado para Cloud Run:
#    - workers: 1 o 2 (adecuado para tareas CPU-intensivas como FFmpeg/Whisper)
#    - timeout-keep-alive: 900 segundos (15 min, alineado con el timeout de Cloud Run)
CMD exec uvicorn main:app --host 0.0.0.0 --port ${PORT} --workers 1 --timeout-keep-alive 900
