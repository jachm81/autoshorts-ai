import os
import logging
from pathlib import Path
from typing import Optional, Dict, Any
import yt_dlp

logger = logging.getLogger("autoshorts.youtube")

class YouTubeBotDetectionError(Exception):
    """Excepción específica cuando YouTube exige verificación de bot."""
    def __init__(self, raw_message: str):
        super().__init__(raw_message)
        self.user_message = (
            "YouTube ha bloqueado la descarga desde la IP del servidor exigiendo verificación humana "
            "('Sign in to confirm you're not a bot'). Por favor, descarga el video en tu equipo "
            "y súbelo directamente usando la pestaña 'Subir Archivo (.mp4)'."
        )

class YouTubeDownloader:
    def __init__(self, output_dir: Path):
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.cookies_file = os.getenv("YOUTUBE_COOKIES_PATH")

    def download_video(self, youtube_url: str, session_id: str) -> str:
        clean_url = youtube_url.strip()
        output_template = str(self.output_dir / f"{session_id}_yt_%(id)s.%(ext)s")

        clients_order = [["ios"], ["android"], ["mweb"]]
        last_exception = None

        for client_group in clients_order:
            logger.info(f"Intentando descargar con player_client: {client_group}...")
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
                        "skip": ["webpage", "configs", "hls"]
                    }
                },
                "http_headers": {
                    "User-Agent": "com.google.ios.youtube/19.09.3 (iPhone14,5; U; CPU iOS 17_4 like Mac OS X) gzip"
                }
            }

            if self.cookies_file and os.path.exists(self.cookies_file):
                ydl_opts["cookiefile"] = self.cookies_file

            try:
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(clean_url, download=True)
                    downloaded = ydl.prepare_filename(info)
                    mp4_file = str(Path(downloaded).with_suffix(".mp4"))
                    return mp4_file if os.path.exists(mp4_file) else downloaded
            except yt_dlp.utils.DownloadError as e:
                err_msg = str(e)
                last_exception = e
                if "Sign in to confirm" in err_msg or "bot" in err_msg.lower():
                    continue
                raise

        err_str = str(last_exception)
        if "confirm you're not a bot" in err_str.lower() or "bot" in err_str.lower():
            raise YouTubeBotDetectionError(err_str)
        raise RuntimeError(err_str)
