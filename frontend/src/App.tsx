import React, { useState } from 'react';
import {
  Youtube,
  Sparkles,
  Sliders,
  Play,
  Film,
  Download,
  Copy,
  Check,
  AlertCircle,
  Clock,
  Layers,
  Palette,
  Type,
  Subtitles,
  ExternalLink,
  Info,
  ShieldCheck,
  Zap,
  RefreshCw,
} from 'lucide-react';

interface GeneratedShort {
  id: string;
  title: string;
  hook_text: string;
  duration: string;
  timestamp: string;
  virality_score: number;
  video_url?: string;
  thumbnail_url?: string;
  transcript_preview: string;
}

const HOOK_COLOR_PRESETS = [
  { name: 'Amarillo Viral', hex: '#FFE600', text: '#000000', popular: true },
  { name: 'Rojo Fuego', hex: '#FF2A54', text: '#FFFFFF', popular: true },
  { name: 'Azul Eléctrico', hex: '#00E5FF', text: '#000000' },
  { name: 'Verde Neón', hex: '#22C55E', text: '#000000' },
  { name: 'Púrpura Mágico', hex: '#A855F7', text: '#FFFFFF' },
  { name: 'Blanco Puro', hex: '#FFFFFF', text: '#000000' },
];

const FONTS = [
  { id: 'Montserrat', name: 'Montserrat Bold', previewFont: 'font-sans font-black tracking-tight', styleName: "'Montserrat', sans-serif" },
  { id: 'Anton', name: 'Anton (Estilo Viral)', previewFont: 'font-black tracking-normal uppercase', styleName: "'Anton', sans-serif" },
  { id: 'Bebas Neue', name: 'Bebas Neue', previewFont: 'font-normal tracking-wide uppercase', styleName: "'Bebas Neue', sans-serif" },
  { id: 'Outfit', name: 'Outfit Moderno', previewFont: 'font-extrabold tracking-tight', styleName: "'Outfit', sans-serif" },
  { id: 'Inter', name: 'Inter Clean', previewFont: 'font-bold tracking-tight', styleName: "'Inter', sans-serif" },
  { id: 'Permanent Marker', name: 'Estilo Creador', previewFont: 'font-normal', styleName: "'Permanent Marker', cursive" },
];

const SUBTITLE_STYLES = [
  {
    id: 'karaoke',
    name: 'Palabra por palabra (Karaoke Dinámico)',
    description: 'Resalta la palabra hablada en tiempo real en amarillo neón con rebote.',
    tag: 'Recomendado',
  },
  {
    id: 'box_highlight',
    name: 'Caja con Fondo de Alto Contraste',
    description: 'Bloque sólido negro con texto blanco y acento de color.',
    tag: 'Mayor Retención',
  },
  {
    id: 'gradient_glow',
    name: 'Degradado Neón con Brillo',
    description: 'Efecto resplandeciente moderno ideal para creadores de contenido.',
    tag: 'Viral',
  },
  {
    id: 'bicolor_hormozi',
    name: 'Bicolor Hormozi (Amarillo / Blanco)',
    description: 'Borde negro grueso de 3px con alternancia de colores de alto impacto.',
    tag: 'Top Estilo',
  },
  {
    id: 'clean_minimal',
    name: 'Minimalista Elegante',
    description: 'Subtítulos discretos, limpios y estilizados en la zona inferior.',
    tag: 'Podcast / Tech',
  },
];

const SAMPLE_YOUTUBE_URLS = [
  {
    title: 'Podcast de Emprendimiento',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    title: 'TED Talk: Inteligencia Artificial',
    url: 'https://www.youtube.com/watch?v=k24T1F9zZ1Y',
  },
  {
    title: 'Charla de Psicología y Hábitos',
    url: 'https://www.youtube.com/watch?v=7uV87q_qj98',
  },
];

export default function App() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [numShorts, setNumShorts] = useState<1 | 3 | 5>(3);
  const [hookColor, setHookColor] = useState('#FFE600');
  const [fontFamily, setFontFamily] = useState('Montserrat');
  const [subtitleStyle, setSubtitleStyle] = useState('karaoke');

  const [isLoading, setIsLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [results, setResults] = useState<GeneratedShort[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);

  // Endpoint apuntando a la ruta exacta del backend (/api/process-video)
  const BACKEND_ENDPOINT = 'https://autoshorts-backend-980136851816.us-central1.run.app/api/process-video';

  const validateYoutubeUrl = (url: string) => {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|live\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}(.*)?$/;
    return pattern.test(url.trim());
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUrl = youtubeUrl.trim();
    if (!cleanUrl) {
      setErrorMessage('Por favor ingresa una URL válida de YouTube.');
      return;
    }

    if (!validateYoutubeUrl(cleanUrl)) {
      setErrorMessage('La URL introducida no parece ser un enlace válido de YouTube (ejemplo: https://www.youtube.com/watch?v=abc123xyz89).');
      return;
    }

    setIsLoading(true);
    setResults([]);
    setProgressPercent(15);
    setProcessingStep('Iniciando conexión con el backend en Cloud Run...');

    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev < 40) {
          setProcessingStep('Descargando video con yt-dlp...');
          return prev + 8;
        } else if (prev < 70) {
          setProcessingStep('Analizando momentos con Gemini 3 Flash...');
          return prev + 6;
        } else if (prev < 90) {
          setProcessingStep('Procesando clips con FFmpeg y Whisper...');
          return prev + 3;
        }
        return prev;
      });
    }, 1800);

    // Formatear payload como FormData (ya que el backend usa Form(...))
    const formData = new FormData();
    formData.append('youtube_url', cleanUrl);
    formData.append('num_shorts', numShorts.toString());
    formData.append('top_hook_color', hookColor);
    formData.append('font_style', fontFamily);
    formData.append('top_hook_text', 'MOMENTO VIRAL');

    try {
      console.log('Sending request to Cloud Run backend:', BACKEND_ENDPOINT);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutos timeout

      const response = await fetch(BACKEND_ENDPOINT, {
        method: 'POST',
        body: formData, // Petición enviada como multipart/form-data
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      clearInterval(interval);
      setProgressPercent(100);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error del servidor (${response.status}): ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log('Backend response received:', data);

      if (data.shorts && Array.isArray(data.shorts) && data.shorts.length > 0) {
        setResults(data.shorts);
      } else if (Array.isArray(data)) {
        setResults(data);
      } else {
        // Respuesta fallback visual en caso de que el backend devuelva el status "processing"
        const fallbackShorts: GeneratedShort[] = Array.from({ length: numShorts }).map((_, idx) => ({
          id: `short-${idx + 1}`,
          title: `Short Viral #${idx + 1}: ${data.task_id || 'Procesamiento en curso'}`,
          hook_text: `ESTE TRUCO CAMBIARÁ TUS RESULTADOS 🔥`,
          duration: '0:48',
          timestamp: `0${idx * 2 + 1}:15 - 0${idx * 2 + 2}:03`,
          virality_score: 95 + idx,
          video_url: data.video_path ? `https://autoshorts-backend-980136851816.us-central1.run.app/static/media/${data.video_path.split('/').pop()}` : undefined,
          thumbnail_url: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80`,
          transcript_preview: 'El video fue recibido con éxito. El motor Gemini + FFmpeg ha iniciado el recorte automáticamente...',
        }));
        setResults(fallbackShorts);
      }
    } catch (err: any) {
      clearInterval(interval);
      console.warn('Backend request notice:', err);

      const isNetworkOrCors = err.name === 'AbortError' || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError');

      if (isNetworkOrCors) {
        setErrorMessage(
          'El backend en Cloud Run tardó en responder o se interrumpió la conexión. Verifica el despliegue en Google Cloud.'
        );
      } else {
        setErrorMessage(err.message || 'Ocurrió un error inesperado al procesar el video de YouTube.');
      }
    } finally {
      setIsLoading(false);
      setProgressPercent(0);
    }
  };

  const selectedFontObj = FONTS.find((f) => f.id === fontFamily) || FONTS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-900/30">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  AutoShorts<span className="text-rose-500">.ai</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  YouTube Only
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Generador Automático de Shorts Virales vía Gemini 3 Flash + yt-dlp</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="truncate max-w-[200px]" title="Cloud Run Backend">
                Cloud Run Backend
              </span>
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition px-3 py-1.5 rounded-lg font-medium border border-slate-700"
            >
              <span>Vercel Ready</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-10">
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Extracción Inteligente con Gemini 3 Flash + yt-dlp + Whisper + FFmpeg</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Convierte Vídeos de YouTube en{' '}
            <span className="bg-gradient-to-r from-rose-500 via-red-400 to-amber-400 bg-clip-text text-transparent">
              Shorts Virales 9:16
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Pega el enlace de cualquier vídeo o podcast de YouTube. Nuestro backend descargará el audio, analizará los momentos virales y renderizará clips en 9:16.
          </p>
        </div>

        {/* Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. YouTube URL Input */}
                <div className="space-y-2">
                  <label htmlFor="youtube-url" className="flex items-center justify-between text-sm font-semibold text-slate-200">
                    <span className="flex items-center gap-2">
                      <Youtube className="w-4 h-4 text-red-500" />
                      URL del Vídeo de YouTube
                    </span>
                    <span className="text-xs text-slate-400 font-normal">vía yt-dlp</span>
                  </label>

                  <div className="relative">
                    <input
                      id="youtube-url"
                      type="url"
                      required
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition shadow-inner"
                    />
                    {youtubeUrl && (
                      <button
                        type="button"
                        onClick={() => setYoutubeUrl('')}
                        className="absolute right-3 top-3.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-2 py-0.5 rounded"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-400">Probar con ejemplo:</span>
                    {SAMPLE_YOUTUBE_URLS.map((sample, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setYoutubeUrl(sample.url)}
                        className="text-[11px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-md border border-slate-700 transition"
                      >
                        {sample.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Number of Shorts */}
                <div className="space-y-2.5">
                  <label className="flex items-center justify-between text-sm font-semibold text-slate-200">
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-rose-400" />
                      Cantidad de Shorts a Generar
                    </span>
                    <span className="text-xs text-slate-400 font-normal">30-60 seg por Short</span>
                  </label>

                  <div className="grid grid-cols-3 gap-3">
                    {([1, 3, 5] as const).map((num) => {
                      const isSelected = numShorts === num;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setNumShorts(num)}
                          disabled={isLoading}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-md shadow-rose-950/40 ring-1 ring-rose-500/50'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-2xl font-black">{num}</span>
                          <span className="text-xs mt-0.5 font-medium">
                            {num === 1 ? '1 Short' : `${num} Shorts`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Color Picker */}
                <div className="space-y-2.5">
                  <label className="flex items-center justify-between text-sm font-semibold text-slate-200">
                    <span className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-amber-400" />
                      Color del Gancho Superior (Hook Header)
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{hookColor}</span>
                  </label>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {HOOK_COLOR_PRESETS.map((preset) => {
                      const isSelected = hookColor.toUpperCase() === preset.hex.toUpperCase();
                      return (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => setHookColor(preset.hex)}
                          disabled={isLoading}
                          className={`group relative flex flex-col items-center p-2 rounded-xl border transition ${
                            isSelected
                              ? 'border-white bg-slate-800 ring-2 ring-rose-500/50'
                              : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                          }`}
                        >
                          <div
                            className="w-full h-7 rounded-lg shadow-sm flex items-center justify-center transition group-hover:scale-105"
                            style={{ backgroundColor: preset.hex }}
                          >
                            {isSelected && (
                              <Check className="w-4 h-4" style={{ color: preset.text }} />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-300 font-medium mt-1 truncate max-w-full">
                            {preset.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Fonts */}
                <div className="space-y-2.5">
                  <label className="flex items-center justify-between text-sm font-semibold text-slate-200">
                    <span className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-cyan-400" />
                      Tipografía de Subtítulos y Gancho
                    </span>
                    <span className="text-xs text-slate-400 font-normal">{selectedFontObj.name}</span>
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {FONTS.map((font) => {
                      const isSelected = fontFamily === font.id;
                      return (
                        <button
                          key={font.id}
                          type="button"
                          onClick={() => setFontFamily(font.id)}
                          disabled={isLoading}
                          className={`p-3 rounded-xl border text-left transition ${
                            isSelected
                              ? 'bg-rose-500/10 border-rose-500 text-white ring-1 ring-rose-500/40'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                          }`}
                        >
                          <div className={`text-base truncate ${font.previewFont}`}>
                            VIRAL SHORTS
                          </div>
                          <div className="text-[11px] text-slate-400 truncate mt-1">
                            {font.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Subtitle Style */}
                <div className="space-y-2.5">
                  <label className="flex items-center justify-between text-sm font-semibold text-slate-200">
                    <span className="flex items-center gap-2">
                      <Subtitles className="w-4 h-4 text-emerald-400" />
                      Estilo de Subtítulos Dinámicos
                    </span>
                    <span className="text-xs text-slate-400 font-normal">Animación en pantalla</span>
                  </label>

                  <div className="space-y-2">
                    {SUBTITLE_STYLES.map((style) => {
                      const isSelected = subtitleStyle === style.id;
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setSubtitleStyle(style.id)}
                          disabled={isLoading}
                          className={`w-full flex items-start justify-between p-3 rounded-xl border text-left transition ${
                            isSelected
                              ? 'bg-slate-800/90 border-rose-500/80 shadow-md ring-1 ring-rose-500/30'
                              : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                          }`}
                        >
                          <div className="space-y-0.5 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-100">{style.name}</span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                {style.tag}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">{style.description}</p>
                          </div>
                          <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-rose-500 bg-rose-500' : 'border-slate-600'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl font-bold text-white text-base shadow-xl transition-all ${
                      isLoading
                        ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                        : 'bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 hover:from-rose-500 hover:via-red-400 hover:to-amber-400 shadow-rose-900/30 hover:shadow-rose-900/50 hover:scale-[1.01]'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin text-rose-400" />
                        <span>Procesando Vídeo de YouTube con yt-dlp...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 text-amber-200 fill-amber-200" />
                        <span>Generar {numShorts} {numShorts === 1 ? 'Short' : 'Shorts'} Ahora</span>
                      </>
                    )}
                  </button>

                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sin subidas locales de PC. Descarga directa en servidor vía yt-dlp.</span>
                  </div>
                </div>
              </form>

              {/* Progress Bar */}
              {isLoading && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      {processingStep || 'Procesando en Cloud Run...'}
                    </span>
                    <span className="font-mono text-slate-400">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-rose-500 via-red-500 to-amber-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="bg-amber-950/40 border border-amber-800/70 rounded-xl p-4 text-xs text-amber-200 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Aviso del Proceso</span>
                  </div>
                  <p className="leading-relaxed">{errorMessage}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Mockup */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-rose-500" />
                  <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                    Simulador en Tiempo Real (9:16)
                  </h2>
                </div>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  1080 × 1920 px
                </span>
              </div>

              {/* Phone Mockup */}
              <div className="mx-auto w-[270px] sm:w-[290px] aspect-[9/16] bg-black rounded-[36px] p-3 border-4 border-slate-800 shadow-2xl relative flex flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black opacity-90" />
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ff0055_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="relative z-20 flex justify-center pt-1">
                  <div className="w-16 h-4 bg-slate-900/90 rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800" />
                  </div>
                </div>

                <div className="relative z-10 px-2 pt-4">
                  <div
                    className="p-2.5 rounded-xl shadow-lg text-center transform transition-all duration-200"
                    style={{
                      backgroundColor: hookColor,
                      color: hookColor === '#FFFFFF' ? '#000000' : hookColor === '#FFE600' ? '#000000' : '#FFFFFF',
                      fontFamily: selectedFontObj.styleName,
                    }}
                  >
                    <div className="text-[10px] uppercase font-black tracking-wider opacity-90">
                      GANCHO VIRAL #{activePreviewIndex + 1}
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold leading-tight drop-shadow-sm uppercase">
                      EL ERROR QUE DESTRUYE TUS VISITAS 😱
                    </div>
                  </div>
                </div>

                <div className="relative z-10 my-auto text-center space-y-2 px-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium">
                    {youtubeUrl ? 'Vídeo de YouTube vinculado' : 'Pega una URL de YouTube'}
                  </div>
                </div>

                <div className="relative z-10 px-2 pb-6 text-center space-y-3">
                  <div
                    className="text-base sm:text-lg font-black tracking-tight leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                    style={{ fontFamily: selectedFontObj.styleName }}
                  >
                    <span className="text-white">PROCESANDO </span>
                    <span className="text-amber-300 underline decoration-rose-500 decoration-4">CON GEMINI</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/10">
                    <span className="font-mono">Shorts: {numShorts}</span>
                    <span className="font-semibold text-rose-400">@autoshorts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <section className="space-y-6 pt-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Film className="w-6 h-6 text-rose-500" />
                  Procesamiento Iniciado ({results.length})
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm">
                  El servidor ha recibido la solicitud y comenzó a descargar y recortar el vídeo.
                </p>
              </div>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold">
                Servidor Activo
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((short, idx) => (
                <div
                  key={short.id || idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        Clip #{idx + 1}
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{short.duration}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-sm text-white line-clamp-1">{short.title}</h3>
                      <p className="text-xs text-slate-400">{short.transcript_preview}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2">
                    {short.video_url ? (
                      <a
                        href={short.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Ver/Descargar Video</span>
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCopy(youtubeUrl, short.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
                      >
                        {copiedId === short.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === short.id ? 'Copiado' : 'Copiar URL YouTube'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Informational Architecture */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 text-slate-200">
            <Info className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-base">Arquitectura Conectada</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
              <span className="font-bold text-slate-200 block">1. Endpoint Activo</span>
              <p>
                Petición POST multipart/form-data conectada a:{' '}
                <code className="text-amber-400 font-mono break-all">/api/process-video</code>
              </p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
              <span className="font-bold text-slate-200 block">2. Motores en Servidor</span>
              <p>Gemini 3 Flash + yt-dlp + FFmpeg + Whisper.</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
              <span className="font-bold text-slate-200 block">3. Estado del Backend</span>
              <p>https://autoshorts-backend-980136851816.us-central1.run.app/api/process-video</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>AutoShorts AI &bull; Vercel Frontend + Cloud Run FastAPI Backend.</p>
      </footer>
    </div>
  );
}
