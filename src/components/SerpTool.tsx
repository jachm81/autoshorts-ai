import React, { useState } from 'react';
import { 
  Search, 
  Smartphone, 
  Monitor, 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  Globe,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { AiMetaResult, MetaVariation } from '../types';

export const SerpTool: React.FC = () => {
  const [title, setTitle] = useState('Las 10 Mejores Herramientas SEO Gratuitas para Posicionar tu Web');
  const [description, setDescription] = useState('Descubre las herramientas SEO más potentes para auditar tu página web, buscar palabras clave y superar a tu competencia en Google hoy mismo.');
  const [url, setUrl] = useState('https://miweb.com/blog/herramientas-seo-gratuitas');
  const [brandName, setBrandName] = useState('Mi Portal Web');
  const [targetKeyword, setTargetKeyword] = useState('herramientas seo');
  
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'google' | 'social' | 'html'>('google');
  
  // AI Generator state
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<AiMetaResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copiedHtml, setCopiedHtml] = useState(false);

  // Character and pixel calculations
  const titleLength = title.length;
  const descLength = description.length;
  // Approximate Google pixel width: 10.2px/char for Arial 20px, 7px/char for Arial 14px
  const titlePixelWidth = Math.round(titleLength * 10.2);
  const descPixelWidth = Math.round(descLength * 7.1);

  // Status indicators
  const getTitleStatus = () => {
    if (titleLength === 0) return { color: 'text-rose-600', text: 'Vacío' };
    if (titleLength < 35) return { color: 'text-amber-600', text: 'Demasiado corto' };
    if (titleLength <= 60 && titlePixelWidth <= 580) return { color: 'text-emerald-600', text: 'Óptimo (~600px)' };
    return { color: 'text-rose-600', text: 'Riesgo de truncamiento en Google' };
  };

  const getDescStatus = () => {
    if (descLength === 0) return { color: 'text-rose-600', text: 'Vacío' };
    if (descLength < 70) return { color: 'text-amber-600', text: 'Demasiado corta' };
    if (descLength <= 160 && descPixelWidth <= 960) return { color: 'text-emerald-600', text: 'Óptima (~960px)' };
    return { color: 'text-rose-600', text: 'Excede longitud recomendada' };
  };

  // Generate with Gemini AI
  const handleGenerateAi = async () => {
    setIsGenerating(true);
    setAiError(null);

    try {
      const res = await fetch('/api/seo/ai-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: title || targetKeyword || 'Optimización SEO',
          currentTitle: title,
          currentDescription: description,
          targetKeyword: targetKeyword,
          language: 'es',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al generar sugerencias.');
      }
      setAiResult(data);
    } catch (err: any) {
      setAiError(err.message || 'Error de conexión con el motor de IA.');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyVariation = (item: MetaVariation) => {
    setTitle(item.title);
    setDescription(item.description);
  };

  const generateHtmlCode = () => {
    return `<!-- SEO Meta Tags Generados -->
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${url}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="article">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:site_name" content="${brandName}">

<!-- Twitter / X -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">`;
  };

  const copyHtml = () => {
    navigator.clipboard.writeText(generateHtmlCode());
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  // Helper for breadcrumbs in SERP
  let cleanDomain = 'miweb.com';
  let cleanPath = 'blog > herramientas-seo-gratuitas';
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    cleanDomain = parsed.hostname;
    const parts = parsed.pathname.split('/').filter(Boolean);
    cleanPath = parts.length > 0 ? parts.join(' › ') : '';
  } catch {
    // fallback
  }

  const titleStatus = getTitleStatus();
  const descStatus = getDescStatus();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Form & Inputs (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Editor y Simulador de Snippet SERP
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ajusta los metadatos para maximizar tu CTR (tasa de clics) en las búsquedas
              </p>
            </div>

            <button
              type="button"
              id="btn-ai-generate-meta"
              onClick={handleGenerateAi}
              disabled={isGenerating}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isGenerating ? 'Generando...' : 'Optimizar con IA'}
            </button>
          </div>

          {/* Title Tag Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="input-meta-title" className="font-semibold text-slate-700">
                Meta Título (Title Tag)
              </label>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${titleStatus.color}`}>
                  {titleStatus.text}
                </span>
                <span className="text-slate-400 font-mono">
                  {titleLength} / 60 caracteres (~{titlePixelWidth}px / 600px)
                </span>
              </div>
            </div>
            <input
              type="text"
              id="input-meta-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
              placeholder="Ej: Las 10 Mejores Herramientas SEO Gratuitas..."
            />
            {/* Visual Pixel Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  titleLength > 60 || titlePixelWidth > 580 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (titleLength / 60) * 100)}%` }}
              />
            </div>
          </div>

          {/* Meta Description Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="input-meta-desc" className="font-semibold text-slate-700">
                Meta Descripción
              </label>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${descStatus.color}`}>
                  {descStatus.text}
                </span>
                <span className="text-slate-400 font-mono">
                  {descLength} / 160 caracteres (~{descPixelWidth}px / 960px)
                </span>
              </div>
            </div>
            <textarea
              id="input-meta-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 leading-relaxed"
              placeholder="Escribe una meta descripción atractiva que resuma el contenido e invite al usuario a hacer clic..."
            />
            {/* Visual Pixel Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  descLength > 160 || descPixelWidth > 960 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (descLength / 160) * 100)}%` }}
              />
            </div>
          </div>

          {/* URL & Keyword Inputs in grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="input-meta-url" className="text-xs font-semibold text-slate-700">
                URL Canónica / Slug
              </label>
              <input
                type="text"
                id="input-meta-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="input-meta-keyword" className="text-xs font-semibold text-slate-700">
                Palabra Clave Objetivo
              </label>
              <input
                type="text"
                id="input-meta-keyword"
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                placeholder="ej: herramientas seo"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* AI Recommendations Panel */}
        {aiError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{aiError}</p>
          </div>
        )}

        {aiResult && (
          <div className="bg-white p-6 rounded-2xl border border-emerald-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Sugerencias de Título y Metas Generadas con IA
              </h3>
            </div>

            <div className="space-y-3">
              {aiResult.variations.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                      {item.angleName}
                    </span>
                    <button
                      type="button"
                      onClick={() => applyVariation(item)}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Aplicar al Simulador
                    </button>
                  </div>

                  <p className="text-sm font-bold text-blue-800 leading-snug">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                  <p className="text-[11px] text-slate-400 italic">
                    Estrategia CTR: {item.ctrReasoning}
                  </p>
                </div>
              ))}
            </div>

            {aiResult.secondaryKeywords?.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-600 block mb-1.5">
                  Palabras Clave Secundarias Recomendadas:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {aiResult.secondaryKeywords.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 text-slate-700 font-medium">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column: Live SERP Simulation (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                id="btn-view-desktop"
                onClick={() => setViewMode('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'desktop'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                Escritorio
              </button>
              <button
                type="button"
                id="btn-view-mobile"
                onClick={() => setViewMode('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'mobile'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Móvil
              </button>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('google')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === 'google' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Google SERP
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('html')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === 'html' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                HTML Tags
              </button>
            </div>
          </div>

          {activeTab === 'google' ? (
            <div className="pt-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-3">
                Simulación en Google Search ({viewMode === 'desktop' ? 'Versión Escritorio' : 'Versión Móvil'})
              </span>

              {/* Google SERP Snippet Preview */}
              <div
                className={`p-4 rounded-xl border border-slate-200 transition-all font-sans ${
                  viewMode === 'mobile' ? 'max-w-xs mx-auto bg-white shadow-md' : 'bg-white'
                }`}
              >
                {/* Header with Favicon + Domain + Breadcrumb */}
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-slate-900 block truncate leading-tight">
                      {cleanDomain}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate leading-tight font-mono">
                      https://{cleanDomain}{cleanPath ? ` › ${cleanPath}` : ''}
                    </span>
                  </div>
                </div>

                {/* Google Blue Link Title */}
                <h3 className="text-lg text-[#1a0dab] hover:underline font-normal cursor-pointer leading-snug mt-1 break-words line-clamp-2">
                  {title || 'Título de tu página aparecerá aquí'}
                </h3>

                {/* Google Snippet Description */}
                <p className="text-xs text-[#4d5156] mt-1.5 leading-relaxed break-words line-clamp-3">
                  {description || 'Aquí se mostrará el extracto de tu meta descripción tal como lo leerán los usuarios en los resultados de búsqueda de Google.'}
                </p>
              </div>

              {/* SERP Checklist details */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Palabra clave en el Title:</span>
                  <span className={title.toLowerCase().includes(targetKeyword.toLowerCase()) ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-medium'}>
                    {title.toLowerCase().includes(targetKeyword.toLowerCase()) ? 'Presente ✓' : 'No detectada'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Palabra clave en la Descripción:</span>
                  <span className={description.toLowerCase().includes(targetKeyword.toLowerCase()) ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-medium'}>
                    {description.toLowerCase().includes(targetKeyword.toLowerCase()) ? 'Presente ✓' : 'No detectada'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Código HTML para tu &lt;head&gt;:</span>
                <button
                  type="button"
                  id="btn-copy-meta-html"
                  onClick={copyHtml}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedHtml ? '¡Copiado!' : 'Copiar Código'}
                </button>
              </div>
              <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed">
                {generateHtmlCode()}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
