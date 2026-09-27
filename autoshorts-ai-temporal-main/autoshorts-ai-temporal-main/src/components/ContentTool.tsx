import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  HelpCircle, 
  BookOpen, 
  RefreshCw,
  AlertCircle,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { ContentAdvisorResult } from '../types';

export const ContentTool: React.FC = () => {
  const [targetKeyword, setTargetKeyword] = useState('herramientas seo');
  const [content, setContent] = useState(`El posicionamiento en buscadores es fundamental para cualquier negocio digital. En este artículo exploraremos las mejores herramientas seo del mercado para mejorar tu visibilidad en Google.

Las herramientas seo nos permiten auditar el estado técnico de una página web, encontrar palabras clave con volumen de búsqueda relevante y monitorizar la evolución de nuestros enlaces y autoridad de dominio.

Existen plataformas completas como Ahrefs o Semrush, pero también disponemos de opciones gratuitas esenciales como Google Search Console y Google Analytics. Al combinar estas soluciones, podemos identificar problemas on-page, como la falta de textos ALT en imágenes o meta descripciones duplicadas, y corregirlos antes de que impacten en el tráfico orgánico.`);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advisorResult, setAdvisorResult] = useState<ContentAdvisorResult | null>(null);

  // Real-time text calculations
  const cleanText = content.trim();
  const words = cleanText ? cleanText.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const charCount = content.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Keyword occurrences
  const kwLower = targetKeyword.trim().toLowerCase();
  let keywordCount = 0;
  if (kwLower) {
    const regex = new RegExp(`\\b${kwLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = content.match(regex);
    keywordCount = matches ? matches.length : 0;
  }
  const keywordDensity = wordCount > 0 ? ((keywordCount * targetKeyword.split(/\s+/).length) / wordCount) * 100 : 0;

  const getDensityStatus = () => {
    if (!targetKeyword.trim()) return { text: 'Sin palabra clave', color: 'text-slate-400' };
    if (keywordCount === 0) return { text: 'Palabra ausente (0%)', color: 'text-rose-600 font-semibold' };
    if (keywordDensity < 0.8) return { text: `Baja densidad (${keywordDensity.toFixed(1)}%)`, color: 'text-amber-600' };
    if (keywordDensity <= 2.5) return { text: `Densidad óptima (${keywordDensity.toFixed(1)}%)`, color: 'text-emerald-600 font-semibold' };
    return { text: `Riesgo de sobreoptimización (${keywordDensity.toFixed(1)}%)`, color: 'text-rose-600 font-semibold' };
  };

  const handleAuditContent = async () => {
    if (!content.trim()) {
      setError('Ingresa el texto a evaluar.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/seo/content-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          targetKeyword,
          language: 'es',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al analizar el contenido.');
      }
      setAdvisorResult(data);
    } catch (err: any) {
      setError(err.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const densityStatus = getDensityStatus();

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Optimizador de Contenido & Redacción SEO Semántica
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Calcula densidad de palabras, legibilidad y audita la calidad temática con Gemini IA
            </p>
          </div>

          <button
            type="button"
            id="btn-audit-content-ai"
            onClick={handleAuditContent}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Auditando con IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analizar Calidad SEO</span>
              </>
            )}
          </button>
        </div>

        {/* Target Keyword Input */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="w-full sm:w-1/2">
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Palabra Clave Objetivo (Target Keyword):
            </label>
            <input
              type="text"
              value={targetKeyword}
              onChange={(e) => setTargetKeyword(e.target.value)}
              placeholder="ej: herramientas seo"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
            />
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3 text-xs pt-4 sm:pt-0">
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500">Palabras: </span>
              <strong className="text-slate-800">{wordCount}</strong>
            </div>
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500">Apariciones: </span>
              <strong className="text-slate-800">{keywordCount} veces</strong>
            </div>
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500">Densidad: </span>
              <span className={densityStatus.color}>{densityStatus.text}</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500">Lectura: </span>
              <strong className="text-slate-800">~{readingTime} min</strong>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Editor & Side Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Area (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Editor del Borrador de Contenido</span>
            <span className="text-[11px] text-slate-400 font-mono">{charCount} caracteres</span>
          </div>

          <textarea
            rows={14}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 leading-relaxed font-sans"
            placeholder="Pega aquí el artículo, entrada de blog o contenido de tu página web..."
          />
        </div>

        {/* AI Recommendations or Guidelines (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {advisorResult ? (
            <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">Diagnóstico Editorial con IA</h3>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  Puntuación: {advisorResult.contentScore}/100
                </div>
              </div>

              {/* Readability */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-500 block mb-0.5">Nivel de Legibilidad:</span>
                <strong className="text-slate-800">{advisorResult.readabilityGrade}</strong>
              </div>

              {/* Strengths */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">Puntos Fuertes:</span>
                <ul className="space-y-1 text-xs text-slate-600">
                  {advisorResult.strengths?.map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Critical Improvements */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">Mejoras Prioritarias:</span>
                <ul className="space-y-1 text-xs text-slate-600">
                  {advisorResult.criticalImprovements?.map((imp, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Missing Semantic Keywords */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block">
                  Términos Semánticos Faltantes (NLP de Google):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {advisorResult.missingSemanticKeywords?.map((term, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200/60">
                      + {term}
                    </span>
                  ))}
                </div>
              </div>

              {/* Suggested FAQs */}
              {advisorResult.suggestedFaqs?.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 block">
                    Preguntas FAQ Recomendadas para Añadir:
                  </span>
                  <div className="space-y-2">
                    {advisorResult.suggestedFaqs.map((faq, i) => (
                      <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                        <p className="font-semibold text-slate-900">{faq.question}</p>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-xs text-slate-600">
              <h3 className="font-bold text-sm text-slate-900">Consejos para Posicionar este Contenido</h3>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Incluye tu palabra clave objetivo en los primeros 100 vocablos del texto.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Mantén una densidad equilibrada entre el 1% y el 2.5% para evitar penalizaciones por keyword stuffing.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Estructura el contenido con subtítulos H2 y H3 claros que respondan la intención de búsqueda.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Haz clic en <strong>"Analizar Calidad SEO"</strong> para que el asistente evalúe tu texto y detecte términos semánticos faltantes.</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
