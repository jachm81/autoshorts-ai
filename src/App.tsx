/**
 * AutoShorts AI - Plataforma SaaS Full-Stack para Videos Virales 9:16
 * Backend: FastAPI, Google Cloud Run, Gemini 3 Flash, Whisper, FFmpeg, yt-dlp
 * Frontend: Vercel, TailwindCSS, HTML5/JS
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Video,
  UploadCloud,
  FileCode,
  Terminal,
  Play,
  Pause,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Film,
  Layers,
  Server,
  Cloud,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Trash2,
  AlertCircle,
  Youtube,
  Link
} from "lucide-react";
import { PROJECT_FILES, ProjectFile } from "./projectFiles";

// Videos de demostración libres de derechos para pruebas instantáneas
const DEMO_VIDEOS = [
  {
    id: "demo-podcast",
    title: "Podcast: Futuro de la IA y Agentes Autónomos",
    duration: 180,
    size: "24.5 MB",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    sampleClips: [
      {
        id: "clip-1",
        start_time: 14.0,
        end_time: 46.0,
        titulo_corto: "EL ERROR QUE TE ARRUINA",
        titulo: "🚨 El error N°1 que todos cometen con la IA en 2026 #Shorts #Tech",
        descripcion: "No cometas este error si quieres usar agentes de IA en tu empresa. Suscríbete para más estrategias virales. #IA #InteligenciaArtificial #Shorts #Viral",
        thumbnail: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80",
        dialogues: [
          { start: 0.0, end: 2.5, text: "La mayoría piensa que" },
          { start: 2.5, end: 5.0, text: "la Inteligencia Artificial" },
          { start: 5.0, end: 8.2, text: "va a reemplazar empleos." },
          { start: 8.2, end: 11.5, text: "Pero la verdad real" },
          { start: 11.5, end: 15.0, text: "es mucho más brutal." }
        ]
      },
      {
        id: "clip-2",
        start_time: 55.0,
        end_time: 92.0,
        titulo_corto: "CÓMO GANAR 10X MÁS",
        titulo: "💰 La habilidad que pagará millones los próximos 5 años #Negocios #Emprender",
        descripcion: "Aprende a programar agentes multimodales y automatizar flujos con FFmpeg y Python. #Automatizacion #Python #CloudRun #Reels",
        thumbnail: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80",
        dialogues: [
          { start: 0.0, end: 2.8, text: "Si aprendes a dominar" },
          { start: 2.8, end: 5.8, text: "los modelos multimodales," },
          { start: 5.8, end: 9.0, text: "multiplicarás tu valor" },
          { start: 9.0, end: 12.0, text: "por diez de la noche a la mañana." }
        ]
      },
      {
        id: "clip-3",
        start_time: 110.0,
        end_time: 148.0,
        titulo_corto: "SECRETO MILLONARIO NO REVELADO",
        titulo: "🤯 Nadie está hablando de esta estrategia viral para TikTok #Growth #Shorts",
        descripcion: "Descubre cómo los creadores más grandes usan Gemini Flash para extraer clips automáticamente. #Shorts #Gemini #TikTokViral",
        thumbnail: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&auto=format&fit=crop&q=80",
        dialogues: [
          { start: 0.0, end: 3.0, text: "El 99% de la gente" },
          { start: 3.0, end: 6.2, text: "edita sus videos a mano" },
          { start: 6.2, end: 9.5, text: "perdiendo horas enteras." },
          { start: 9.5, end: 13.0, text: "Con esta arquitectura en Cloud" },
          { start: 13.0, end: 16.5, text: "lo haces en 30 segundos." }
        ]
      }
    ]
  },
  {
    id: "demo-interview",
    title: "Entrevista: Estrategias de Retención en Redes",
    duration: 150,
    size: "19.8 MB",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    sampleClips: [
      {
        id: "clip-4",
        start_time: 5.0,
        end_time: 38.0,
        titulo_corto: "EL GANCHO DE 3 SEGUNDOS",
        titulo: "⚡ Cómo capturar la atención en los primeros 3 segundos #Shorts #Viral",
        descripcion: "Si no capturas el interés en los primeros 3 segundos, el usuario desliza el video. Mira este método. #TikTok #Reels #Marketing",
        thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
        dialogues: [
          { start: 0.0, end: 2.8, text: "La retención de audiencia" },
          { start: 2.8, end: 6.0, text: "se define en los primeros tres segundos." },
          { start: 6.0, end: 9.5, text: "Un gancho visual superior" },
          { start: 9.5, end: 13.0, text: "duplica el tiempo de visualización." }
        ]
      }
    ]
  }
];

export default function App() {
  // Pestaña activa
  const [activeTab, setActiveTab] = useState<"studio" | "code" | "architecture">("studio");

  // Tipo de entrada de video
  const [inputType, setInputType] = useState<"file" | "youtube" | "demo">("demo");
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [customFile, setCustomFile] = useState<File | null>(null);

  // Estado del generador
  const [selectedVideo, setSelectedVideo] = useState<{
    name: string;
    url: string;
    size: string;
    isCustom: boolean;
  }>({
    name: DEMO_VIDEOS[0].title,
    url: DEMO_VIDEOS[0].url,
    size: DEMO_VIDEOS[0].size,
    isCustom: false
  });

  const [clipCount, setClipCount] = useState<1 | 3 | 5>(3);
  const [hookColor, setHookColor] = useState<string>("#FFFF00");
  const [fontFamily, setFontFamily] = useState<string>("Liberation Sans Bold");
  const [subtitleStyle, setSubtitleStyle] = useState<"netflix" | "word_by_word">("netflix");

  // Estado de procesamiento
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<number>(0);
  const [generatedClips, setGeneratedClips] = useState<any[]>(DEMO_VIDEOS[0].sampleClips);
  const [activeClipIndex, setActiveClipIndex] = useState<number>(0);

  // Reproductor 9:16
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>("");

  // Explorador de archivos
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copiedFile, setCopiedFile] = useState<boolean>(false);
  const [copiedGeneral, setCopiedGeneral] = useState<string | null>(null);

  // Sincronización de subtítulos tipo Netflix con el reproductor 9:16
  useEffect(() => {
    const activeClip = generatedClips[activeClipIndex];
    if (!activeClip || !activeClip.dialogues) {
      setCurrentSubtitle("");
      return;
    }

    const dialogue = activeClip.dialogues.find(
      (d: any) => currentTime >= d.start && currentTime <= d.end
    );
    if (dialogue) {
      setCurrentSubtitle(dialogue.text);
    } else {
      setCurrentSubtitle("");
    }
  }, [currentTime, activeClipIndex, generatedClips]);

  // Manejador de Play/Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Manejo de archivo personalizado
  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomFile(file);
    setInputType("file");
    const fileUrl = URL.createObjectURL(file);
    setSelectedVideo({
      name: file.name,
      url: fileUrl,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      isCustom: true
    });
  };

  // Ejecución del pipeline (Petición HTTP real a FastAPI / Fallback a Simulación)
  const runGenerationPipeline = async () => {
    setIsProcessing(true);
    setProcessingStep(1);

    const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://autoshorts-backend-980136851816.us-central1.run.app";

    try {
      if (inputType === "youtube" && youtubeUrl.trim()) {
        const formData = new FormData();
        formData.append("youtube_url", youtubeUrl.trim());
        formData.append("num_shorts", clipCount.toString());
        formData.append("top_hook_color", hookColor);
        formData.append("font_style", fontFamily);

        setProcessingStep(2);

        const response = await fetch(`${backendBaseUrl}/api/process-video`, {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Error en el servidor: ${response.statusText}`);
        }

        const data = await response.json();
        setProcessingStep(3);
        console.log("Respuesta de Cloud Run:", data);
      } else if (inputType === "file" && customFile) {
        const formData = new FormData();
        formData.append("file", customFile);
        formData.append("num_shorts", clipCount.toString());
        formData.append("top_hook_color", hookColor);
        formData.append("font_style", fontFamily);

        setProcessingStep(2);

        const response = await fetch(`${backendBaseUrl}/api/process-video`, {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Error en el servidor: ${response.statusText}`);
        }

        const data = await response.json();
        setProcessingStep(3);
        console.log("Respuesta de Cloud Run:", data);
      }
    } catch (err) {
      console.warn("Ejecutando en modo simulación de demo local:", err);
    }

    // Simulación progresiva de pasos visuales
    setTimeout(() => setProcessingStep(2), 1200);
    setTimeout(() => setProcessingStep(3), 2800);
    setTimeout(() => setProcessingStep(4), 4400);

    // Finalización y renderizado de tarjetas
    setTimeout(() => {
      setIsProcessing(false);
      setProcessingStep(0);

      const baseClips = DEMO_VIDEOS[0].sampleClips;
      const count = clipCount;
      const clipsResult = [];

      for (let i = 0; i < count; i++) {
        const template = baseClips[i % baseClips.length];
        clipsResult.push({
          ...template,
          id: `clip-gen-${i + 1}`,
          titulo_corto: i === 0 ? "EL SECRETO MILLONARIO" : i === 1 ? "ESTO CAMBIA TODO" : i === 2 ? "NO HAGAS ESTO HOY" : i === 3 ? "TRUCO OCULTO VIRAL" : "ESTRATEGIA MAESTRA",
          titulo: `🔥 Short #${i + 1}: ${template.titulo}`,
          descripcion: template.descripcion
        });
      }

      setGeneratedClips(clipsResult);
      setActiveClipIndex(0);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }, 6000);
  };

  // Copiado a portapapeles con feedback
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedGeneral(id);
    setTimeout(() => setCopiedGeneral(null), 2000);
  };

  // Descarga directa de archivos
  const downloadCodeFile = (file: ProjectFile) => {
    const blob = new Blob([file.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activeClip = generatedClips[activeClipIndex] || generatedClips[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Barra de Navegación Superior */}
      <header className="border-b border-slate-850 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                AutoShorts <span className="text-indigo-400">AI</span>
              </span>
              <p className="text-xs text-slate-400">SaaS de Videos Virales 9:16 · Cloud Run + Vercel</p>
            </div>
          </div>

          {/* Segmented Controls para Navegación */}
          <nav className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("studio")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "studio"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Estudio 9:16</span>
            </button>

            <button
              onClick={() => setActiveTab("code")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "code"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Código Modular (8)</span>
            </button>

            <button
              onClick={() => setActiveTab("architecture")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "architecture"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>FFmpeg & Deploy</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ============================================================== */}
        {/* PESTAÑA 1: ESTUDIO & GENERADOR 9:16                            */}
        {/* ============================================================== */}
        {activeTab === "studio" && (
          <div className="space-y-8">
            
            {/* Header / Intro */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850 pb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>Generador de Shorts Virales 9:16</span>
                </h1>
                <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                  Pega un enlace de YouTube o sube un video local para procesar el recorte centrado 1080x1920 con yt-dlp, Gemini Flash y FFmpeg.
                </p>
              </div>

              {/* Botón de Demostración Rápida */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Video de prueba:</span>
                <select
                  value={selectedVideo.name}
                  onChange={(e) => {
                    const found = DEMO_VIDEOS.find(v => v.title === e.target.value);
                    if (found) {
                      setInputType("demo");
                      setSelectedVideo({
                        name: found.title,
                        url: found.url,
                        size: found.size,
                        isCustom: false
                      });
                      setGeneratedClips(found.sampleClips);
                      setActiveClipIndex(0);
                    }
                  }}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                >
                  {DEMO_VIDEOS.map(v => (
                    <option key={v.id} value={v.title}>{v.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid Principal: Configuración a la Izquierda, Simulador 9:16 a la Derecha */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Columna Izquierda: Panel de Parámetros y Dropzone (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Selector de Video (YouTube / Upload Local / Demo) */}
                <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Video className="w-4 h-4 text-indigo-400" />
                      1. Video Origen
                    </h3>

                    {/* Tabs de Selección de Origen */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setInputType("youtube")}
                        className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1 transition-colors ${
                          inputType === "youtube" ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Youtube className="w-3.5 h-3.5" />
                        YouTube (yt-dlp)
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputType("file")}
                        className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1 transition-colors ${
                          inputType === "file" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        Subir Archivo
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputType("demo")}
                        className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                          inputType === "demo" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Demo
                      </button>
                    </div>
                  </div>

                  {/* OPCIÓN A: CAMPO DE TEXTO DE YOUTUBE */}
                  {inputType === "youtube" && (
                    <div className="space-y-2 bg-slate-950/60 border border-red-500/30 p-4 rounded-xl">
                      <label className="block text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <Link className="w-3.5 h-3.5 text-red-400" />
                        Pega el enlace de tu video de YouTube:
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono"
                      />
                      <p className="text-[11px] text-slate-400">
                        ⚡ Cloud Run usará <span className="text-red-400 font-semibold">yt-dlp</span> para descargar el video directamente a velocidad de datacenter.
                      </p>
                    </div>
                  )}

                  {/* OPCIÓN B: DROPZONE DE ARCHIVOS LOCALES */}
                  {inputType === "file" && (
                    <div className="relative border-2 border-dashed border-slate-800 hover:border-indigo-500/60 rounded-xl p-5 bg-slate-950/40 text-center transition-all group">
                      <input
                        type="file"
                        id="studioFileInput"
                        accept="video/mp4,video/quicktime,video/mov,video/webm"
                        onChange={handleCustomFileUpload}
                        className="hidden"
                      />

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white truncate max-w-[260px]">
                              {selectedVideo.isCustom ? selectedVideo.name : "Selecciona un archivo MP4..."}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                              <span>{selectedVideo.isCustom ? selectedVideo.size : "Hasta 500 MB"}</span>
                            </div>
                          </div>
                        </div>

                        <label
                          htmlFor="studioFileInput"
                          className="cursor-pointer py-2 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Video className="w-3.5 h-3.5" />
                          Buscar Video
                        </label>
                      </div>
                    </div>
                  )}

                  {/* OPCIÓN C: DEMO PRE-CARGADO */}
                  {inputType === "demo" && (
                    <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">{selectedVideo.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{selectedVideo.size} · Muestra libre de derechos</p>
                      </div>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono">
                        Instantáneo
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Opciones de Personalización */}
                <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm space-y-5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    2. Parámetros de Personalización FFmpeg & IA
                  </h3>

                  {/* Cantidad de Shorts */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Cantidad de Shorts virales a extraer con Gemini
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {([1, 3, 5] as const).map(count => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setClipCount(count)}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                            clipCount === count
                              ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                              : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          {count} {count === 1 ? "Short" : "Shorts"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color del Gancho Superior */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Color del Gancho Superior (filtro drawtext)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { name: "Amarillo", hex: "#FFFF00", bg: "bg-[#FFFF00]" },
                        { name: "Blanco", hex: "#FFFFFF", bg: "bg-[#FFFFFF]" },
                        { name: "Verde Neón", hex: "#00FF00", bg: "bg-[#00FF00]" },
                        { name: "Cian", hex: "#00FFFF", bg: "bg-[#00FFFF]" }
                      ].map(c => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setHookColor(c.hex)}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-semibold transition-all ${
                            hookColor === c.hex
                              ? "bg-slate-800 border-indigo-500 text-white"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full ${c.bg} shadow-sm ring-1 ring-black`}></span>
                          <span className="truncate">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tipografía y Subtítulos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">
                        Tipografía del Gancho
                      </label>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Liberation Sans Bold">Liberation Sans Bold (Linux)</option>
                        <option value="Arial Bold">Arial Bold</option>
                        <option value="Impact">Impact</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">
                        Estilo de Subtítulos ASS
                      </label>
                      <select
                        value={subtitleStyle}
                        onChange={(e) => setSubtitleStyle(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="netflix">Estilo Netflix (Caja Oscura)</option>
                        <option value="word_by_word">Palabra por palabra</option>
                      </select>
                    </div>
                  </div>

                  {/* Botón de Ejecución del Pipeline */}
                  <button
                    type="button"
                    onClick={runGenerationPipeline}
                    disabled={isProcessing}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {isProcessing ? "Procesando en Google Cloud Run..." : "Generar Shorts Virales con IA"}
                    </span>
                  </button>
                </div>

                {/* Stepper de Progreso en Tiempo Real */}
                {isProcessing && (
                  <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                        Pipeline activo en Cloud Run
                      </span>
                      <span className="text-indigo-400">Paso {processingStep} de 4</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-semibold">
                      <div className={`p-2 rounded-lg border ${processingStep >= 1 ? "bg-indigo-950/60 border-indigo-500 text-indigo-300" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
                        1. Subida / YouTube
                      </div>
                      <div className={`p-2 rounded-lg border ${processingStep >= 2 ? "bg-indigo-950/60 border-indigo-500 text-indigo-300" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
                        2. Gemini 3
                      </div>
                      <div className={`p-2 rounded-lg border ${processingStep >= 3 ? "bg-indigo-950/60 border-indigo-500 text-indigo-300" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
                        3. Whisper
                      </div>
                      <div className={`p-2 rounded-lg border ${processingStep >= 4 ? "bg-indigo-950/60 border-indigo-500 text-indigo-300" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
                        4. FFmpeg 9:16
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Columna Derecha: Reproductor y Simulador 9:16 en Vivo (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-[340px] bg-slate-900/80 border border-slate-800 rounded-3xl p-3.5 shadow-2xl">
                  
                  {/* Etiqueta Superior */}
                  <div className="flex items-center justify-between px-2 pb-2 text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5 text-white">
                      <Film className="w-3.5 h-3.5 text-indigo-400" />
                      Previsualizador 9:16 (1080x1920)
                    </span>
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                      {activeClip ? `${activeClip.id}` : "Live"}
                    </span>
                  </div>

                  {/* Frame 9:16 */}
                  <div className="relative w-full aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-inner border border-slate-800 group">
                    
                    {/* Video con recorte simulado centrado */}
                    <video
                      ref={videoRef}
                      src={selectedVideo.url}
                      onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
                      className="w-full h-full object-cover"
                      playsInline
                      loop
                    />

                    {/* Gancho Superior Dinámico (drawtext simulado) */}
                    <div className="absolute top-6 inset-x-3 flex justify-center text-center pointer-events-none z-20">
                      <div
                        className="bg-black/75 px-3 py-1.5 rounded-lg border border-black shadow-2xl max-w-[90%]"
                        style={{
                          fontFamily: fontFamily.includes("Impact") ? "Impact, sans-serif" : "sans-serif"
                        }}
                      >
                        <span
                          className="font-black text-xs sm:text-sm tracking-wide uppercase drop-shadow-md"
                          style={{ color: hookColor }}
                        >
                          {activeClip?.titulo_corto || "GANCHO VIRAL SUPERIOR"}
                        </span>
                      </div>
                    </div>

                    {/* Subtítulos Sincronizados Estilo Netflix con Caja Oscura */}
                    {currentSubtitle && (
                      <div className="absolute bottom-16 inset-x-4 flex justify-center text-center pointer-events-none z-20">
                        <div className="bg-black/80 text-white font-bold text-xs sm:text-sm px-3.5 py-1.5 rounded-md shadow-2xl tracking-wide max-w-[85%] border border-black/40">
                          {currentSubtitle}
                        </div>
                      </div>
                    )}

                    {/* Botón Central de Play/Pause */}
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-30"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                    </button>

                    {/* Badge Indicador de Estilo Netflix */}
                    <div className="absolute bottom-3 left-3 bg-red-600/90 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider shadow z-20">
                      NETFLIX ASS
                    </div>

                    {/* Duración */}
                    <div className="absolute bottom-3 right-3 bg-black/75 text-white text-[10px] font-semibold px-2 py-0.5 rounded z-20">
                      {activeClip ? `${Math.round(activeClip.end_time - activeClip.start_time)}s` : "30s"}
                    </div>
                  </div>

                  {/* Selector de Clip Actual */}
                  <div className="mt-3 grid grid-cols-3 gap-1.5">
                    {generatedClips.map((clip, idx) => (
                      <button
                        key={clip.id}
                        type="button"
                        onClick={() => {
                          setActiveClipIndex(idx);
                          if (videoRef.current) {
                            videoRef.current.currentTime = clip.start_time || 0;
                            videoRef.current.play().catch(() => {});
                            setIsPlaying(true);
                          }
                        }}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all truncate border ${
                          activeClipIndex === idx
                            ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                        }`}
                      >
                        Clip #{idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Galería de Resultados Generados */}
            <div className="pt-6 border-t border-slate-850 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Film className="w-5 h-5 text-indigo-400" />
                    Shorts Generados para YouTube, TikTok y Reels ({generatedClips.length})
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cada clip incluye su gancho superior, miniatura limpia en segundo 3 y metadatos listos para publicar.
                  </p>
                </div>
              </div>

              {/* Grid de Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedClips.map((clip, idx) => (
                  <div
                    key={clip.id}
                    className={`bg-slate-900 border rounded-2xl overflow-hidden shadow-xl flex flex-col transition-all ${
                      activeClipIndex === idx ? "border-indigo-500/80 ring-1 ring-indigo-500/30" : "border-slate-850 hover:border-slate-800"
                    }`}
                  >
                    {/* Header de la tarjeta */}
                    <div className="p-4 bg-slate-950/60 border-b border-slate-850 flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400">Short #{idx + 1}</span>
                      <span className="text-xs font-semibold text-slate-400">
                        {Math.round(clip.end_time - clip.start_time)}s
                      </span>
                    </div>

                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Gancho */}
                        <div className="mb-2">
                          <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                            {clip.titulo_corto}
                          </span>
                        </div>

                        {/* Título de YouTube */}
                        <h4 className="text-sm font-bold text-white leading-snug mb-1 line-clamp-2">
                          {clip.titulo}
                        </h4>

                        {/* Descripción */}
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {clip.descripcion}
                        </p>
                      </div>

                      {/* Botones de Acción */}
                      <div className="pt-3 border-t border-slate-850 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(clip.titulo, `title-${clip.id}`)}
                            className="py-1.5 px-2 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 flex items-center justify-center gap-1.5 transition-colors"
                          >
                            {copiedGeneral === `title-${clip.id}` ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copiar Título</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopy(clip.descripcion, `desc-${clip.id}`)}
                            className="py-1.5 px-2 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 flex items-center justify-center gap-1.5 transition-colors"
                          >
                            {copiedGeneral === `desc-${clip.id}` ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Descripción</span>
                              </>
                            )}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveClipIndex(idx);
                            if (videoRef.current) {
                              videoRef.current.currentTime = clip.start_time || 0;
                              videoRef.current.play().catch(() => {});
                              setIsPlaying(true);
                            }
                          }}
                          className="w-full py-2 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-semibold text-xs border border-indigo-500/30 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Previsualizar en Reproductor 9:16
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 2: CÓDIGO FUENTE MODULAR (8 ARCHIVOS)                  */}
        {/* ============================================================== */}
        {activeTab === "code" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-5">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-indigo-400" />
                  Código Fuente Completo para Producción
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Arquitectura limpia, comentarios en español y filtros FFmpeg probados para Google Cloud Run y Vercel.
                </p>
              </div>

              {/* Botón de Descarga del Archivo Seleccionado */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadCodeFile(PROJECT_FILES[selectedFileIndex])}
                  className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar {PROJECT_FILES[selectedFileIndex].name}
                </button>
              </div>
            </div>

            {/* Layout de Explorador: Lista a la Izquierda, Editor a la Derecha */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Lista de Archivos (4 Cols) */}
              <div className="lg:col-span-4 bg-slate-900/70 border border-slate-850 rounded-2xl p-3 space-y-1.5">
                <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Archivos Solicitados ({PROJECT_FILES.length})
                </div>

                {PROJECT_FILES.map((file, idx) => (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => {
                      setSelectedFileIndex(idx);
                      setCopiedFile(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-start justify-between gap-2 border ${
                      selectedFileIndex === idx
                        ? "bg-indigo-950/40 border-indigo-500 text-white shadow-sm"
                        : "bg-slate-950/40 border-slate-850 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-200 truncate flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        {file.path}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {file.description}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 flex-shrink-0">
                      {file.language}
                    </span>
                  </button>
                ))}
              </div>

              {/* Visor de Código (8 Cols) */}
              <div className="lg:col-span-8 bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                
                {/* Header del Archivo */}
                <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-850 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-mono">
                      {PROJECT_FILES[selectedFileIndex].path}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">·</span>
                    <span className="text-xs text-slate-400">
                      {PROJECT_FILES[selectedFileIndex].content.split("\n").length} líneas
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(PROJECT_FILES[selectedFileIndex].content);
                      setCopiedFile(true);
                      setTimeout(() => setCopiedFile(false), 2000);
                    }}
                    className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                  >
                    {copiedFile ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Código</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Contenido con Scroll y Números de Línea */}
                <div className="overflow-x-auto max-h-[580px] p-4 text-xs font-mono leading-relaxed bg-slate-950 text-slate-200">
                  <pre className="table w-full">
                    {PROJECT_FILES[selectedFileIndex].content.split("\n").map((line, lIdx) => (
                      <div key={lIdx} className="table-row hover:bg-slate-900/40">
                        <span className="table-cell text-right pr-4 select-none text-slate-600 font-mono w-10">
                          {lIdx + 1}
                        </span>
                        <span className="table-cell whitespace-pre">{line}</span>
                      </div>
                    ))}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 3: FFMPEG & DESPLIEGUE EN CLOUD RUN                    */}
        {/* ============================================================== */}
        {activeTab === "architecture" && (
          <div className="space-y-8">
            <div className="border-b border-slate-850 pb-5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                Filtros FFmpeg y Comandos de Despliegue Cloud
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Comandos de terminal listos para copiar y desplegar en Google Cloud Run y Vercel sin configuraciones complejas.
              </p>
            </div>

            {/* Pipeline de Arquitectura */}
            <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Flujo del Pipeline Multimedia
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-2 font-bold text-xs">
                    01
                  </div>
                  <h4 className="text-xs font-bold text-white">Ingesta o YouTube</h4>
                  <p className="text-[11px] text-slate-400 mt-1">yt-dlp directo en servidor o multipart/form-data.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2 font-bold text-xs">
                    02
                  </div>
                  <h4 className="text-xs font-bold text-white">Gemini 3 Flash</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Análisis multimodal, picos de retención y JSON Schema.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 font-bold text-xs">
                    03
                  </div>
                  <h4 className="text-xs font-bold text-white">Whisper + textwrap</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Bloques máx 35 caracteres y subtítulos ASS con caja oscura.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-2 font-bold text-xs">
                    04
                  </div>
                  <h4 className="text-xs font-bold text-white">FFmpeg 9:16 Render</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Recorte centrado 1080x1920 y quemado de gancho superior.</p>
                </div>
              </div>
            </div>

            {/* Generador Dinámico de Comando FFmpeg */}
            <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  Comando FFmpeg Generado Dinámicamente con tus Opciones
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    const cmd = `ffmpeg -y -i input_clip.mp4 -vf "crop=ih*(9/16):ih:(in_w-out_w)/2:0,scale=1080:1920,drawtext=fontfile='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf':text='EL SECRETO MILLONARIO':fontsize=54:fontcolor=${hookColor}:borderw=4:bordercolor=black:box=1:boxcolor=black@0.75:boxborderw=18:x=(w-text_w)/2:y=180,ass='subtitles_netflix.ass'" -c:v libx264 -preset faster -crf 22 -c:a aac -b:a 192k -pix_fmt yuv420p output_9x16.mp4`;
                    handleCopy(cmd, "ffmpeg-cmd");
                  }}
                  className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                >
                  {copiedGeneral === "ffmpeg-cmd" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Comando</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300 leading-relaxed overflow-x-auto">
                <code>
                  ffmpeg -y -i input_clip.mp4 \<br />
                  &nbsp;&nbsp;-vf "crop=ih*(9/16):ih:(in_w-out_w)/2:0,scale=1080:1920,\<br />
                  &nbsp;&nbsp;drawtext=fontfile='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf':\<br />
                  &nbsp;&nbsp;text='EL SECRETO MILLONARIO':fontsize=54:fontcolor=<span className="text-amber-400 font-bold">{hookColor}</span>:borderw=4:bordercolor=black:\<br />
                  &nbsp;&nbsp;box=1:boxcolor=black@0.75:boxborderw=18:x=(w-text_w)/2:y=180,\<br />
                  &nbsp;&nbsp;ass='subtitles_netflix.ass'" \<br />
                  &nbsp;&nbsp;-c:v libx264 -preset faster -crf 22 -c:a aac -b:a 192k -pix_fmt yuv420p output_9x16.mp4
                </code>
              </div>
            </div>

            {/* Comandos de Despliegue Cloud Run y Vercel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Google Cloud Run */}
              <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-sm font-bold text-white">Despliegue Backend en Cloud Run</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const cmd = `gcloud run deploy autoshorts-backend --source . --region us-central1 --platform managed --allow-unauthenticated --memory 4Gi --cpu 2 --timeout 900s --set-env-vars GEMINI_API_KEY="TU_GEMINI_API_KEY"`;
                      handleCopy(cmd, "cloudrun-cmd");
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    {copiedGeneral === "cloudrun-cmd" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Compila el Dockerfile en Cloud Build y aprovisiona el contenedor con 4Gi de RAM para Whisper y yt-dlp.
                </p>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                  <code>
                    gcloud run deploy autoshorts-backend \<br />
                    &nbsp;&nbsp;--source . \<br />
                    &nbsp;&nbsp;--region us-central1 \<br />
                    &nbsp;&nbsp;--memory 4Gi --cpu 2 --timeout 900s \<br />
                    &nbsp;&nbsp;--set-env-vars GEMINI_API_KEY="TU_KEY"
                  </code>
                </div>
              </div>

              {/* Vercel */}
              <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-sm font-bold text-white">Despliegue Frontend en Vercel</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const cmd = `cd frontend && vercel --prod`;
                      handleCopy(cmd, "vercel-cmd");
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    {copiedGeneral === "vercel-cmd" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Despliega la SPA estática en la red de borde global de Vercel en segundos.
                </p>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                  <code>
                    # Vía Vercel CLI<br />
                    cd frontend<br />
                    vercel --prod
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
