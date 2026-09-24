# AutoShorts AI - SaaS de Videos Virales 9:16

Plataforma SaaS de alto rendimiento para transformar automáticamente videos largos (podcasts, webinars, conferencias, vlogs) en **Shorts / Reels / TikToks virales en formato 9:16**, potenciada por:
- **Google GenAI SDK (`google-genai`)** con el modelo multimodal **Gemini 3 Flash** para detección de momentos de alta retención.
- **OpenAI Whisper** para transcripción de audio sincronizada a frases cortas (máximo 35 caracteres con `textwrap`).
- **FFmpeg & libass** para recorte centrado 1080x1920, inyección dinámica de ganchos superiores (`drawtext`) y subtítulos con caja oscura estilo Netflix (`BorderStyle=4, BackColour=&H80000000&`).
- **Arquitectura Dividida**: Backend contenedorizado en **Google Cloud Run** y Frontend estático ultrarrápido en **Vercel**.

---

## 📁 Estructura del Proyecto

```text
├── Dockerfile                   # Imagen Debian Slim optimizada con FFmpeg y fuentes TrueType
├── requirements.txt             # Dependencias de Python (FastAPI, google-genai, whisper, etc.)
├── config.py                    # Configuración global, variables de entorno y rutas de fuentes
├── main.py                      # API REST FastAPI (CORS, /api/process-video, descargas)
├── services/
│   ├── __init__.py
│   ├── gemini_service.py        # Subida a Google File API y análisis con Gemini 3 Flash
│   └── video_service.py         # Subclips, Whisper, subtítulos ASS Netflix y FFmpeg 9:16
├── frontend/
│   └── index.html               # SPA moderna en HTML5 + TailwindCSS + JS Vanilla para Vercel
└── README.md                    # Manual de despliegue paso a paso
```

---

## 🚀 Despliegue del Backend en Google Cloud Run

Google Cloud Run es la plataforma ideal para este backend debido a su compatibilidad nativa con contenedores Docker, escalado a cero (para mantenerse en la capa gratuita) y asignación elástica de CPU y memoria para tareas multimedia.

### Paso 1: Prerrequisitos en Google Cloud
1. Instala el [Google Cloud SDK (gcloud CLI)](https://cloud.google.com/sdk/docs/install).
2. Autentica tu cuenta y selecciona tu proyecto:
   ```bash
   gcloud auth login
   gcloud config set project TU_PROJECT_ID_DE_GCP
   ```
3. Habilita las APIs requeridas:
   ```bash
   gcloud services enable run.googleapis.com \
                          cloudbuild.googleapis.com \
                          artifactregistry.googleapis.com
   ```
4. Obtén tu clave de API de Gemini desde [Google AI Studio](https://aistudio.google.com/).

### Paso 2: Despliegue con un Solo Comando (Cloud Build + Cloud Run)
Desde la raíz del repositorio, ejecuta:

```bash
gcloud run deploy autoshorts-backend \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 4Gi \
  --cpu 2 \
  --timeout 900s \
  --concurrency 10 \
  --set-env-vars GEMINI_API_KEY="TU_GEMINI_API_KEY",GEMINI_MODEL="gemini-3.6-flash",WHISPER_MODEL="base"
```

> **Parámetros Clave para Multimedia en Cloud Run:**
> - `--memory 4Gi`: Proporciona la memoria RAM necesaria para cargar el modelo de Whisper y procesar streams de video de alta definición.
> - `--cpu 2`: Acelera la codificación x264 de FFmpeg y la inferencia de Whisper.
> - `--timeout 900s`: Extiende el límite de tiempo a 15 minutos para permitir la subida y renderizado de videos largos.

Al finalizar el despliegue, la consola de Google Cloud te entregará la URL pública HTTPS de tu servicio, por ejemplo:
`https://autoshorts-backend-xxxxxxxxxx-uc.a.run.app`

Prueba la salud del backend:
```bash
curl https://autoshorts-backend-xxxxxxxxxx-uc.a.run.app/api/health
```

---

## 🌐 Despliegue del Frontend en Vercel

El frontend está diseñado como una SPA estática optimizada (HTML5, TailwindCSS CDN, Vanilla JS) lista para ser servida desde el borde (Edge Network) de Vercel.

### Opción A: Despliegue con Vercel CLI (Rápido)
1. Instala el CLI de Vercel:
   ```bash
   npm i -g vercel
   ```
2. Entra a la carpeta del frontend y despliega:
   ```bash
   cd frontend
   vercel --prod
   ```

### Opción B: Despliegue mediante GitHub
1. Sube tu código a un repositorio de GitHub.
2. Inicia sesión en [Vercel](https://vercel.com/) y selecciona **Add New Project**.
3. Importa el repositorio y en la sección **Root Directory**, selecciona `frontend`.
4. Haz clic en **Deploy**.

### Conexión Frontend -> Backend
Una vez abierto el frontend en Vercel, haz clic en el botón superior derecho **Cloud Run API** e ingresa la URL HTTPS que te dio Cloud Run. La aplicación recordará esta URL en `localStorage`.

---

## 💻 Pruebas y Desarrollo Local con Docker

Si deseas probar todo el stack localmente antes de desplegar en la nube:

1. **Construir la imagen Docker local:**
   ```bash
   docker build -t autoshorts-backend .
   ```

2. **Ejecutar el contenedor:**
   ```bash
   docker run -d -p 8080:8080 \
     -e GEMINI_API_KEY="TU_GEMINI_API_KEY" \
     -e GEMINI_MODEL="gemini-3.6-flash" \
     -v $(pwd)/storage:/app/storage \
     --name autoshorts-container autoshorts-backend
   ```

3. **Verificar el servicio:**
   Abre en tu navegador `http://localhost:8080/docs` para explorar la documentación interactiva Swagger UI de FastAPI.

4. **Abrir el Frontend local:**
   Abre directamente `frontend/index.html` en tu navegador o levanta un servidor ligero:
   ```bash
   npx serve frontend
   ```

---

## ⚙️ Explicación de los Filtros FFmpeg Utilizados

### 1. Recorte Centrado 9:16 (1080x1920)
```text
crop=ih*(9/16):ih:(in_w-out_w)/2:0,scale=1080:1920
```
- `crop=ih*(9/16):ih`: Toma el 100% de la altura del video (`ih`) y calcula un ancho equivalente a la proporción 9:16.
- `(in_w-out_w)/2:0`: Centra el recorte horizontalmente exactamente en el medio del encuadre.
- `scale=1080:1920`: Escala la resolución resultante al estándar de alta definición vertical.

### 2. Inyección Dinámica del Gancho Superior (`drawtext`)
```text
drawtext=fontfile='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf':text='TITULO GANCHO':fontsize=54:fontcolor=#FFFF00:borderw=4:bordercolor=black:box=1:boxcolor=black@0.75:boxborderw=18:x=(w-text_w)/2:y=180
```
- Ubica el gancho en la parte superior (`y=180`) fuera del área de peligro de los avatares de TikTok/Shorts.
- `box=1:boxcolor=black@0.75:boxborderw=18`: Genera una almohadilla oscura de fondo que garantiza 100% de legibilidad sin importar el fondo del video.

### 3. Subtítulos Estilo Netflix con Formato ASS
```text
Style: Netflix,Arial,52,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,1,0,4,0,0,2,40,40,240,1
```
- `BorderStyle=4`: Activa la caja delimitadora opaca / semitransparente.
- `BackColour=&H80000000`: Fondo negro con 50% de transparencia que cubre cualquier texto o subtítulo en el video original.
- `MarginV=240`: Eleva los subtítulos para no colisionar con la descripción, nombres de usuario o barra de reproducción de las plataformas móviles.

---

## 🛡️ Licencia
Este proyecto es código abierto y está preparado para ser extendido en una solución SaaS comercial con pasarela de pagos (Stripe), autenticación y almacenamiento en Google Cloud Storage / AWS S3.
