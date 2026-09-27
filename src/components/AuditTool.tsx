import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  FileCode, 
  ExternalLink,
  Clock,
  FileText,
  Image as ImageIcon,
  Link2,
  Share2,
  Cpu,
  Sparkles,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { SeoAuditResult } from '../types';

export const AuditTool: React.FC = () => {
  const [url, setUrl] = useState('https://wikipedia.org');
  const [rawHtml, setRawHtml] = useState('');
  const [useRawHtml, setUseRawHtml] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<SeoAuditResult | null>(null);
  const [filterCheck, setFilterCheck] = useState<'all' | 'pass' | 'warning' | 'fail'>('all');
  const [activeSubTab, setActiveSubTab] = useState<'checks' | 'headings' | 'images' | 'links' | 'social'>('checks');
  const [copied, setCopied] = useState(false);

  const sampleUrls = [
    { label: 'Wikipedia', url: 'https://wikipedia.org' },
    { label: 'WordPress Org', url: 'https://wordpress.org' },
    { label: 'GitHub', url: 'https://github.com' },
  ];

  const handleAudit = async (overrideUrl?: string) => {
    const targetUrl = overrideUrl || url;
    if (!useRawHtml && !targetUrl.trim()) {
      setError('Por favor ingresa una URL válida');
      return;
    }
    if (useRawHtml && !rawHtml.trim()) {
      setError('Por favor pega el código HTML');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/seo/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: useRawHtml ? undefined : targetUrl.trim(),
          rawHtml: useRawHtml ? rawHtml : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al ejecutar la auditoría');
      }
      setAuditResult(data);
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const copyReport = () => {
    if (!auditResult) return;
    const summary = `Auditoría SEO: ${auditResult.url}
Puntuación General: ${auditResult.overallScore}/100
Título: ${auditResult.title} (${auditResult.titleLength} caracteres)
Meta Descripción: ${auditResult.metaDescription} (${auditResult.descLength} caracteres)
Palabras: ${auditResult.content.wordCount}
H1: ${auditResult.headings.h1.length} | H2: ${auditResult.headings.h2.length}
Imágenes sin ALT: ${auditResult.images.withoutAlt} de ${auditResult.images.total}
Diagnósticos: ${auditResult.checks.filter(c => c.status === 'pass').length} Pasaron, ${auditResult.checks.filter(c => c.status === 'warning').length} Advertencias, ${auditResult.checks.filter(c => c.status === 'fail').length} Errores.`;
    
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const filteredChecks = auditResult?.checks.filter((c) => {
    if (filterCheck === 'all') return true;
    return c.status === filterCheck;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Search and Input Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Auditoría SEO On-Page en Vivo
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspecciona títulos, meta tags, jerarquía de encabezados, enlaces e imágenes de cualquier web
            </p>
          </div>
          <button
            type="button"
            id="toggle-html-mode-btn"
            onClick={() => setUseRawHtml(!useRawHtml)}
            className="text-xs font-medium text-slate-600 hover:text-emerald-600 flex items-center gap-1.5 transition-colors"
          >
            <FileCode className="w-3.5 h-3.5" />
            {useRawHtml ? 'Cambiar a modo URL' : '¿Prefieres pegar código HTML directo?'}
          </button>
        </div>

        {!useRawHtml ? (
          <div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Globe className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  id="audit-url-input"
                  placeholder="https://ejemplo.com/pagina"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAudit()}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                />
              </div>
              <button
                type="button"
                id="run-audit-btn"
                onClick={() => handleAudit()}
                disabled={loading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analizando...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Analizar SEO</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Test Presets */}
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
              <span className="font-medium text-slate-600">Probar ejemplo:</span>
              <div className="flex flex-wrap gap-1.5">
                {sampleUrls.map((s) => (
                  <button
                    key={s.url}
                    id={`sample-url-${s.label.toLowerCase()}`}
                    onClick={() => {
                      setUrl(s.url);
                      handleAudit(s.url);
                    }}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-xs cursor-pointer"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              id="raw-html-textarea"
              rows={4}
              placeholder="<html><head><title>Título de mi web</title>...</head><body>...</body></html>"
              value={rawHtml}
              onChange={(e) => setRawHtml(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
            />
            <button
              type="button"
              id="run-html-audit-btn"
              onClick={() => handleAudit()}
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analizando HTML...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Analizar Código HTML</span>
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
            <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* Audit Results Section */}
      {auditResult && (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-5">
                <div className={`w-20 h-20 rounded-2xl border flex flex-col items-center justify-center font-bold ${getScoreColor(auditResult.overallScore)}`}>
                  <span className="text-2xl leading-none">{auditResult.overallScore}</span>
                  <span className="text-[10px] uppercase font-semibold tracking-wider opacity-80 mt-1">/ 100</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900 break-all">
                      {auditResult.url}
                    </h3>
                    <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      HTTP {auditResult.statusCode}
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 text-slate-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {auditResult.responseTimeMs} ms
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {auditResult.title || 'Sin etiqueta title definida'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="copy-audit-summary-btn"
                  onClick={copyReport}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? '¡Copiado!' : 'Copiar Resumen'}
                </button>
              </div>
            </div>

            {/* Quick Metrics Bento Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block">Palabras Totales</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">{auditResult.content.wordCount}</span>
                <span className="text-[10px] text-slate-400">~{auditResult.content.readingTimeMinutes} min lectura</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block">Encabezado H1</span>
                <span className={`text-base font-bold mt-0.5 block ${auditResult.headings.h1.length === 1 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {auditResult.headings.h1.length}
                </span>
                <span className="text-[10px] text-slate-400">{auditResult.headings.h1.length === 1 ? 'Correcto (1 único)' : 'Requiere revisión'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block">Subtítulos H2/H3</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">
                  {auditResult.headings.h2.length} / {auditResult.headings.h3Count}
                </span>
                <span className="text-[10px] text-slate-400">Estructura de secciones</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block">Imágenes</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">{auditResult.images.total}</span>
                <span className={`text-[10px] ${auditResult.images.withoutAlt > 0 ? 'text-rose-600 font-medium' : 'text-emerald-600'}`}>
                  {auditResult.images.withoutAlt} sin ALT
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block">Enlaces Internos</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">{auditResult.links.internal}</span>
                <span className="text-[10px] text-slate-400">{auditResult.links.external} externos</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block">Schema JSON-LD</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">{auditResult.technical.jsonLdCount}</span>
                <span className="text-[10px] text-slate-400">{auditResult.technical.jsonLdCount > 0 ? 'Detectado' : 'No encontrado'}</span>
              </div>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex border-b border-slate-200 space-x-2 text-sm font-medium">
            <button
              id="subtab-checks-btn"
              onClick={() => setActiveSubTab('checks')}
              className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                activeSubTab === 'checks'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Diagnóstico On-Page ({auditResult.checks.length})
            </button>
            <button
              id="subtab-headings-btn"
              onClick={() => setActiveSubTab('headings')}
              className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                activeSubTab === 'headings'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Jerarquía de Encabezados (H1-H4)
            </button>
            <button
              id="subtab-images-btn"
              onClick={() => setActiveSubTab('images')}
              className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                activeSubTab === 'images'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Imágenes & Alt ({auditResult.images.total})
            </button>
            <button
              id="subtab-links-btn"
              onClick={() => setActiveSubTab('links')}
              className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                activeSubTab === 'links'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Enlaces & Anclas
            </button>
            <button
              id="subtab-social-btn"
              onClick={() => setActiveSubTab('social')}
              className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                activeSubTab === 'social'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Open Graph & Social
            </button>
          </div>

          {/* Subtab Content: CHECKS */}
          {activeSubTab === 'checks' && (
            <div className="space-y-4">
              {/* Filter pills */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 mr-1">Filtrar:</span>
                <button
                  id="filter-checks-all"
                  onClick={() => setFilterCheck('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    filterCheck === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todos ({auditResult.checks.length})
                </button>
                <button
                  id="filter-checks-pass"
                  onClick={() => setFilterCheck('pass')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    filterCheck === 'pass'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  Pasaron ({auditResult.checks.filter((c) => c.status === 'pass').length})
                </button>
                <button
                  id="filter-checks-warning"
                  onClick={() => setFilterCheck('warning')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    filterCheck === 'warning'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  Advertencias ({auditResult.checks.filter((c) => c.status === 'warning').length})
                </button>
                <button
                  id="filter-checks-fail"
                  onClick={() => setFilterCheck('fail')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    filterCheck === 'fail'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  Errores ({auditResult.checks.filter((c) => c.status === 'fail').length})
                </button>
              </div>

              {/* Checks list */}
              <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 shadow-xs overflow-hidden">
                {filteredChecks.map((check, index) => {
                  return (
                    <div key={index} className="p-4 flex items-start gap-3.5 hover:bg-slate-50/50 transition-colors">
                      {check.status === 'pass' && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      {check.status === 'warning' && (
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      {check.status === 'fail' && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-slate-900">{check.title}</h4>
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {check.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{check.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Subtab Content: HEADINGS */}
          {activeSubTab === 'headings' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Árbol de Encabezados (H1-H4)</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Una jerarquía semántica ordenada facilita el rastreo e indexación de Google
                </p>
              </div>

              <div className="space-y-4">
                {/* H1 */}
                <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[11px] font-bold">
                      H1 ({auditResult.headings.h1.length})
                    </span>
                    <span className="text-xs text-emerald-800 font-medium">Título Principal</span>
                  </div>
                  {auditResult.headings.h1.length > 0 ? (
                    <ul className="space-y-1.5 pl-2">
                      {auditResult.headings.h1.map((h1, i) => (
                        <li key={i} className="text-sm text-slate-800 font-semibold list-disc list-inside">
                          {h1}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-rose-600">No se encontró ningún H1 en la página.</p>
                  )}
                </div>

                {/* H2 */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-slate-700 text-white rounded text-[11px] font-bold">
                      H2 ({auditResult.headings.h2.length})
                    </span>
                    <span className="text-xs text-slate-600 font-medium">Subsecciones Principales</span>
                  </div>
                  {auditResult.headings.h2.length > 0 ? (
                    <ul className="space-y-2 pl-2 max-h-80 overflow-y-auto pr-2">
                      {auditResult.headings.h2.map((h2, i) => (
                        <li key={i} className="text-xs text-slate-700 list-disc list-inside leading-relaxed">
                          {h2}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500">No se detectaron etiquetas H2.</p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
                  <span>H3 detectados: <strong className="text-slate-800">{auditResult.headings.h3Count}</strong></span>
                  <span>H4 detectados: <strong className="text-slate-800">{auditResult.headings.h4Count}</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* Subtab Content: IMAGES */}
          {activeSubTab === 'images' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Auditoría de Imágenes y Textos ALT</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    El texto alternativo es crucial para la accesibilidad web y el posicionamiento en Google Imágenes
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {auditResult.images.withoutAlt} sin ALT de {auditResult.images.total}
                  </span>
                </div>
              </div>

              {auditResult.images.sample.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No se encontraron imágenes en el documento.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {auditResult.images.sample.map((img, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-slate-800 truncate text-[11px]">{img.src || '[src vacío]'}</p>
                          <p className="text-slate-500 mt-0.5">
                            ALT: <span className={img.hasAlt ? 'text-slate-800 font-medium' : 'text-rose-600 italic'}>
                              {img.hasAlt ? `"${img.alt}"` : 'Falta atributo alt descriptivo'}
                            </span>
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                        img.hasAlt ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {img.hasAlt ? 'Con ALT' : 'Falta ALT'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subtab Content: LINKS */}
          {activeSubTab === 'links' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Estructura de Enlaces y Textos Ancla</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Muestra de enlaces encontrados, destino y atributos nofollow
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 block">Enlaces Internos</span>
                  <span className="text-lg font-bold text-slate-800">{auditResult.links.internal}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 block">Enlaces Externos</span>
                  <span className="text-lg font-bold text-slate-800">{auditResult.links.external}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 block">Enlaces Nofollow</span>
                  <span className="text-lg font-bold text-slate-800">{auditResult.links.nofollow}</span>
                </div>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {auditResult.links.sample.map((lnk, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 truncate">{lnk.text}</p>
                      <p className="font-mono text-slate-500 text-[11px] truncate mt-0.5">{lnk.href}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${lnk.isExternal ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200 text-slate-700'}`}>
                        {lnk.isExternal ? 'Externo' : 'Interno'}
                      </span>
                      {lnk.isNofollow && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">
                          nofollow
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtab Content: SOCIAL */}
          {activeSubTab === 'social' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Etiquetas Open Graph y Twitter Card</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Controla cómo se muestra tu contenido al compartirse en WhatsApp, Facebook, LinkedIn y X
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Facebook OG Card preview */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <div className="p-2.5 bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-700">
                    Vista Previa Open Graph (Facebook / LinkedIn)
                  </div>
                  {auditResult.social.ogImage ? (
                    <div className="h-44 bg-slate-200 overflow-hidden">
                      <img
                        src={auditResult.social.ogImage}
                        alt="OG Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="h-32 bg-slate-200 flex items-center justify-center text-xs text-slate-400">
                      Sin imagen og:image definida
                    </div>
                  )}
                  <div className="p-4 bg-white">
                    <p className="text-[11px] text-slate-400 uppercase font-medium truncate">
                      {auditResult.social.ogUrl || auditResult.url}
                    </p>
                    <p className="text-sm font-bold text-slate-900 mt-1 line-clamp-2">
                      {auditResult.social.ogTitle || auditResult.title || 'Sin og:title'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {auditResult.social.ogDescription || auditResult.metaDescription || 'Sin og:description'}
                    </p>
                  </div>
                </div>

                {/* Twitter card */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <div className="p-2.5 bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-700">
                    Vista Previa Twitter / X Card
                  </div>
                  {auditResult.social.twitterImage || auditResult.social.ogImage ? (
                    <div className="h-44 bg-slate-200 overflow-hidden">
                      <img
                        src={auditResult.social.twitterImage || auditResult.social.ogImage}
                        alt="Twitter Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="h-32 bg-slate-200 flex items-center justify-center text-xs text-slate-400">
                      Sin twitter:image definida
                    </div>
                  )}
                  <div className="p-4 bg-white">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Tipo: {auditResult.social.twitterCard || 'summary_large_image'}
                    </span>
                    <p className="text-sm font-bold text-slate-900 mt-1 line-clamp-2">
                      {auditResult.social.twitterTitle || auditResult.social.ogTitle || auditResult.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {auditResult.social.twitterDescription || auditResult.social.ogDescription || auditResult.metaDescription}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
