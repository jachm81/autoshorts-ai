# Backend Python - AutoShorts AI

Microservicio en Python (FastAPI) encargado de la descarga y renderizado pesado de video mediante:
- **yt-dlp**: Extracción de streams de video y audio desde enlaces de YouTube.
- **OpenAI Whisper**: Transcripción y detección de marcas de tiempo con mayor gancho verbal.
- **FFmpeg**: Corte vertical a relación de aspecto 9:16 (1080x1920) y quemado de subtítulos y gancho superior.

## Despliegue en Google Cloud Run

```bash
gcloud run deploy autoshorts-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 4Gi \
  --cpu 2 \
  --timeout 300
```
