import logging
import os
from pathlib import Path
from typing import Any, Dict, Optional
import yt_dlp

logger = logging.getLogger("autoshorts.youtube")

# Excepciones tipadas para evitar HTTP 500 genéricos
class YouTubeError(Exception):
    def __init__(self, message: str, user_friendly_message: str, error_type: str = "YOUTUBE_ERROR"):
        super().__init__(message)
        self.user_friendly_message = user_friendly_message
        self.error_type = error_type

class YouTubeBotDetectionError(YouTubeError):
    def __init__(self, raw_message: str):
        super().__init__(
            raw_message,
            "YouTube ha bloqueado la IP de Cloud Run solicitando verificación de bot ('Sign in to confirm you're not a bot'). "
            "Por favor, descarga el video en tu equipo y sube el archivo directamente.",
            error_type="YOUTUBE_BOT_DETECTION"
        )

class YouTubeUnavailableError(YouTubeError):
    def __init__(self, raw_message: str):
        super().__init__(
            raw_message,
            "El video de YouTube no está disponible (puede ser privado, eliminado o con restricción de edad).",
            error_type="YOUTUBE_UNAVAILABLE"
        )

class YouTubeDownloader:
    def __init__(self, output_dir: Path):
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.cookies_file = os.getenv("YOUTUBE_COOKIES_PATH")

    def download_video(self, youtube_url: str, session_id: str) -> str:
        clean_url = youtube_url.strip()
        output_template = str(self.output_dir / f"{session_id}_yt_%(id)s.%(ext)s")

        # Clientes con rotación para evitar el bloqueo de Cloud Run
        clients_order = [["android", "ios"], ["mweb"], ["tv_embedded"]]
        last_exception = None

        for client_group in clients_order:
            ydl_opts: Dict[str, Any] = {
                "format": "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
                "outtmpl": output_template,
                "merge_output_format": "mp4",
                "noplaylist": True,
                "quiet": True,
                "socket_timeout": 30,
                "retries": 3,
                "extractor_args": {
                    "youtube": {
                        "player_client": client_group,
                        "skip": ["hls", "dash"]
                    }
                },
                "http_headers": {
                    "User-Agent": "com.google.android.youtube/19.09.37 (Linux; U; Android 14) gzip"
                }
            }

            if self.cookies_file and os.path.exists(self.cookies_file):
                ydl_opts["cookiefile"] = self.cookies_file

            try:
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(clean_url, download=True)
                    downloaded_file = ydl.prepare_filename(info)
                    mp4_file = str(Path(downloaded_file).with_suffix(".mp4"))
                    if os.path.exists(mp4_file):
                        return mp4_file
                    return downloaded_file
            except yt_dlp.utils.DownloadError as e:
                err_msg = str(e)
                last_exception = e
                if "Sign in to confirm" in err_msg or "bot" in err_msg.lower():
                    continue  # Intenta con el siguiente cliente
                if "unavailable" in err_msg.lower() or "private" in err_msg.lower():
                    raise YouTubeUnavailableError(err_msg)

        err_str = str(last_exception)
        if "confirm you're not a bot" in err_str.lower() or "bot" in err_str.lower():
            raise YouTubeBotDetectionError(err_str)
        raise YouTubeError(err_str, "Fallo al descargar video de YouTube.", "YOUTUBE_DOWNLOAD_FAILED")
