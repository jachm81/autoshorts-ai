import React, { useState } from 'react';
import { 
  KeyRound, 
  Search, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  HelpCircle, 
  Layers, 
  BarChart3,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { KeywordResearchResult } from '../types';

export const KeywordTool: React.FC = () => {
  const [seedKeyword, setSeedKeyword] = useState('herramientas seo');
  const [country, setCountry] = useState('España');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<KeywordResearchResult | null>(null);
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const sampleKeywords = [
    'herramientas seo',
    'diseño web wordpress',
    'mejores zapatillas running',
    'curso marketing digital',
    'recetas saludables faciles',
  ];

  const handleSearch = async (overrideKeyword?: string) => {
    const kw = overrideKeyword || seedKeyword;
    if (!kw.trim()) {
      setError('Por favor ingresa una palabra clave.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/seo/keyword-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: kw.trim(),
          country,
          language: 'es',
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Error al obtener investigación de palabras clave.');
      }
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyword(id);
    setTimeout(() => setCopiedKeyword(null), 1800);
  };

  const exportCsv = () => {
    if (!data) return;
    const header = 'Palabra Clave,Intencion,Dificultad,Volumen,Oportunidad\n';
    const rows = data.relatedKeywords
      .map(
        (k) =>
          `"${k.keyword}","${k.intent}","${k.difficulty}","${k.volume}","${k.opportunity || ''}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `keywords-${data.seedKeyword.replace(/\s+/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getIntentBadge = (intent: string) => {
    const i = intent.toLowerCase();
    if (i.includes('transac')) {
      return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">Transaccional</span>;
    }
    if (i.includes('comercial')) {
      return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">Comercial</span>;
    }
    if (i.includes('nav')) {
      return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800">Navegacional</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">Informacional</span>;
  };

  const getDifficultyBadge = (diff: string) => {
    const d = diff.toLowerCase();
    if (d.includes('fác') || d.includes('fac') || d.includes('baja') || d.includes('low')) {
      return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Baja / Fácil</span>;
    }
    if (d.includes('alt') || d.includes('dif') || d.includes('high')) {
      return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Alta</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Media</span>;
  };

  const filteredKeywords = data?.relatedKeywords.filter((k) =>
    k.keyword.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Top Search Input Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Investigación de Palabras Clave y Análisis de Intención
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Descubre oportunidades de búsqueda, preguntas frecuentes (PAA) y entidades semánticas con IA
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="input-seed-keyword"
              placeholder="Ingresa una palabra clave semilla (ej: cursos de python, agencia seo...)"
              value={seedKeyword}
              onChange={(e) => setSeedKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
            />
          </div>

          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="España">España</option>
            <option value="México">México</option>
            <option value="Colombia">Colombia</option>
            <option value="Argentina">Argentina</option>
            <option value="Chile">Chile</option>
            <option value="Estados Unidos (Español)">EE.UU. (Español)</option>
            <option value="Global">Hispanoamérica Global</option>
          </select>

          <button
            type="button"
            id="btn-search-keywords"
            onClick={() => handleSearch()}
            disabled={loading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all shrink-0 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analizando...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Investigar Término</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Sample Chips */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span className="font-medium text-slate-600">Probar idea:</span>
          <div className="flex flex-wrap gap-1.5">
            {sampleKeywords.map((kw) => (
              <button
                key={kw}
                onClick={() => {
                  setSeedKeyword(kw);
                  handleSearch(kw);
                }}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-xs cursor-pointer"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* Results View */}
      {data && (
        <div className="space-y-6">
          {/* Strategic Overview Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Estrategia SEO
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Resumen para "{data.seedKeyword}"
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Intención Dominante</span>
                  <div className="mt-0.5">{getIntentBadge(data.primaryIntent)}</div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Dificultad General</span>
                  <div className="mt-0.5">{getDifficultyBadge(data.overallDifficulty)}</div>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {data.strategicSummary}
            </p>

            {data.recommendedFormat && (
              <div className="p-3 bg-emerald-50/50 border border-emerald-200/60 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Formato de contenido recomendado:</strong> {data.recommendedFormat}
                </span>
              </div>
            )}
          </div>

          {/* Keywords Table with Filter & CSV Export */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  Palabras Clave Relacionadas & Long-Tail ({filteredKeywords.length})
                </h4>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Filtrar palabras..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-48"
                />
                <button
                  type="button"
                  onClick={exportCsv}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exportar CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Palabra Clave</th>
                    <th className="py-3 px-4">Intención</th>
                    <th className="py-3 px-4">Dificultad</th>
                    <th className="py-3 px-4">Volumen</th>
                    <th className="py-3 px-4">Oportunidad / Enfoque</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredKeywords.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {item.keyword}
                      </td>
                      <td className="py-3 px-4">
                        {getIntentBadge(item.intent)}
                      </td>
                      <td className="py-3 px-4">
                        {getDifficultyBadge(item.difficulty)}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">
                        {item.volume}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        {item.opportunity || 'Relevante para contenido pillar'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(item.keyword, `kw-${index}`)}
                          className="text-slate-400 hover:text-emerald-600 p-1 rounded transition-colors cursor-pointer"
                          title="Copiar palabra"
                        >
                          {copiedKeyword === `kw-${index}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* People Also Ask (PAA) Questions & Semantic Entities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PAA Questions */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Preguntas Frecuentes de Usuarios (People Also Ask)
                </h4>
              </div>
              <p className="text-xs text-slate-500">
                Añade estas preguntas exactas como encabezados H2 o sección FAQ para ganar Rich Snippets
              </p>

              <div className="space-y-2">
                {data.questionsPAA?.map((q, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50 hover:bg-blue-50/40 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs text-slate-800 transition-colors"
                  >
                    <span>{q}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(q, `paa-${i}`)}
                      className="text-slate-400 hover:text-blue-600 shrink-0 p-1 cursor-pointer"
                      title="Copiar pregunta"
                    >
                      {copiedKeyword === `paa-${i}` ? (
                        <Check className="w-3.5 h-3.5 text-blue-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Semantic Entities / LSI */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Entidades Semánticas y Términos LSI
                </h4>
              </div>
              <p className="text-xs text-slate-500">
                Palabras y conceptos que enriquecen la relevancia temática para los algoritmos de Google
              </p>

              <div className="flex flex-wrap gap-2">
                {data.semanticEntitiesLSI?.map((lsi, i) => (
                  <button
                    key={i}
                    onClick={() => copyToClipboard(lsi, `lsi-${i}`)}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl text-xs font-medium text-slate-700 hover:text-emerald-800 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>{lsi}</span>
                    {copiedKeyword === `lsi-${i}` ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
