import React, { useState } from 'react';
import { 
  FileText, 
  Layers, 
  Copy, 
  Check, 
  Download, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert,
  Globe
} from 'lucide-react';

export const RobotsSitemapTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'robots' | 'sitemap'>('robots');

  // Robots.txt State
  const [sitemapUrl, setSitemapUrl] = useState('https://miweb.com/sitemap.xml');
  const [crawlDelay, setCrawlDelay] = useState('');
  const [rules, setRules] = useState([
    { userAgent: '*', allow: ['/'], disallow: ['/wp-admin/', '/checkout/', '/tmp/'] },
    { userAgent: 'GPTBot', allow: [], disallow: ['/'] },
  ]);

  // Sitemap.xml State
  const [domainBase, setDomainBase] = useState('https://miweb.com');
  const [sitemapUrls, setSitemapUrls] = useState([
    { loc: '/', priority: '1.0', changefreq: 'daily', lastmod: '2026-03-12' },
    { loc: '/blog', priority: '0.8', changefreq: 'weekly', lastmod: '2026-03-10' },
    { loc: '/servicios', priority: '0.8', changefreq: 'monthly', lastmod: '2026-03-01' },
    { loc: '/contacto', priority: '0.5', changefreq: 'yearly', lastmod: '2026-02-15' },
  ]);

  const [copiedRobots, setCopiedRobots] = useState(false);
  const [copiedSitemap, setCopiedSitemap] = useState(false);

  // Generate Robots.txt string
  const generateRobotsTxt = () => {
    let output = '# robots.txt generado con Herramientas SEO Pro\n\n';
    rules.forEach((r) => {
      output += `User-agent: ${r.userAgent || '*'}\n`;
      r.allow.forEach((a) => {
        if (a.trim()) output += `Allow: ${a.trim()}\n`;
      });
      r.disallow.forEach((d) => {
        if (d.trim()) output += `Disallow: ${d.trim()}\n`;
      });
      output += '\n';
    });

    if (crawlDelay.trim()) {
      output += `Crawl-delay: ${crawlDelay}\n\n`;
    }

    if (sitemapUrl.trim()) {
      output += `Sitemap: ${sitemapUrl.trim()}\n`;
    }

    return output.trim();
  };

  // Generate Sitemap XML string
  const generateSitemapXml = () => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    sitemapUrls.forEach((u) => {
      const fullUrl = u.loc.startsWith('http') ? u.loc : `${domainBase.replace(/\/$/, '')}${u.loc.startsWith('/') ? '' : '/'}${u.loc}`;
      xml += `  <url>\n`;
      xml += `    <loc>${fullUrl}</loc>\n`;
      if (u.lastmod) xml += `    <lastmod>${u.lastmod}</lastmod>\n`;
      if (u.changefreq) xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
      if (u.priority) xml += `    <priority>${u.priority}</priority>\n`;
      xml += `  </url>\n`;
    });
    xml += `</urlset>`;
    return xml;
  };

  // Presets for Robots.txt
  const applyPreset = (type: 'standard' | 'blockAdmin' | 'blockAi' | 'blockAll') => {
    if (type === 'standard') {
      setRules([{ userAgent: '*', allow: ['/'], disallow: ['/admin/', '/private/'] }]);
    } else if (type === 'blockAdmin') {
      setRules([{ userAgent: '*', allow: ['/'], disallow: ['/wp-admin/', '/admin/', '/api/', '/login/'] }]);
    } else if (type === 'blockAi') {
      setRules([
        { userAgent: '*', allow: ['/'], disallow: ['/admin/'] },
        { userAgent: 'GPTBot', allow: [], disallow: ['/'] },
        { userAgent: 'CCBot', allow: [], disallow: ['/'] },
        { userAgent: 'Google-Extended', allow: [], disallow: ['/'] },
      ]);
    } else if (type === 'blockAll') {
      setRules([{ userAgent: '*', allow: [], disallow: ['/'] }]);
    }
  };

  const copyRobots = () => {
    navigator.clipboard.writeText(generateRobotsTxt());
    setCopiedRobots(true);
    setTimeout(() => setCopiedRobots(false), 2000);
  };

  const copySitemap = () => {
    navigator.clipboard.writeText(generateSitemapXml());
    setCopiedSitemap(true);
    setTimeout(() => setCopiedSitemap(false), 2000);
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Top selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Generador de Robots.txt y Sitemap XML
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configura el rastreo de bots, indexabilidad y mapa del sitio según los estándares de Google
          </p>
        </div>

        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('robots')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'robots' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Robots.txt
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sitemap')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'sitemap' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sitemap.xml
          </button>
        </div>
      </div>

      {/* Tab: ROBOTS.TXT */}
      {activeTab === 'robots' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Plantillas Rápidas</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => applyPreset('standard')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                >
                  Estándar (Permitir casi todo)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('blockAdmin')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                >
                  Bloquear Admin / WP
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('blockAi')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium cursor-pointer"
                >
                  Bloquear Bots de IA (GPTBot, CCBot)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('blockAll')}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-medium cursor-pointer"
                >
                  Bloquear Todo (Sitio en desarrollo)
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Reglas por Agente (User-Agent)</h3>

              {rules.map((rule, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-700">User-agent:</label>
                      <input
                        type="text"
                        value={rule.userAgent}
                        onChange={(e) => {
                          const updated = [...rules];
                          updated[idx].userAgent = e.target.value;
                          setRules(updated);
                        }}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs font-mono"
                        placeholder="* o Googlebot"
                      />
                    </div>
                    {rules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setRules(rules.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Allow paths */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-emerald-700 block">Rutas Permitidas (Allow):</label>
                    <input
                      type="text"
                      value={rule.allow.join(', ')}
                      onChange={(e) => {
                        const updated = [...rules];
                        updated[idx].allow = e.target.value.split(',').map((s) => s.trim());
                        setRules(updated);
                      }}
                      placeholder="ej: / (separadas por comas)"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-mono"
                    />
                  </div>

                  {/* Disallow paths */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-rose-700 block">Rutas Bloqueadas (Disallow):</label>
                    <input
                      type="text"
                      value={rule.disallow.join(', ')}
                      onChange={(e) => {
                        const updated = [...rules];
                        updated[idx].disallow = e.target.value.split(',').map((s) => s.trim());
                        setRules(updated);
                      }}
                      placeholder="ej: /admin/, /privado/ (separadas por comas)"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-mono"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setRules([...rules, { userAgent: 'Googlebot', allow: ['/'], disallow: [] }])}
                className="py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir otro User-Agent
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Directiva Sitemap:</label>
                <input
                  type="url"
                  value={sitemapUrl}
                  onChange={(e) => setSitemapUrl(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Crawl-delay (segundos, opcional):</label>
                <input
                  type="number"
                  value={crawlDelay}
                  onChange={(e) => setCrawlDelay(e.target.value)}
                  placeholder="ej: 10"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-slate-300">robots.txt</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyRobots}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedRobots ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedRobots ? '¡Copiado!' : 'Copiar'}
                </button>
                <button
                  type="button"
                  onClick={() => downloadFile(generateRobotsTxt(), 'robots.txt', 'text/plain')}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar
                </button>
              </div>
            </div>

            <pre className="p-3.5 bg-slate-950 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed flex-1">
              {generateRobotsTxt()}
            </pre>

            <p className="text-[11px] text-slate-400">
              Guarda este archivo en la raíz de tu dominio (ej: <code className="text-slate-200">https://miweb.com/robots.txt</code>).
            </p>
          </div>
        </div>
      )}

      {/* Tab: SITEMAP.XML */}
      {activeTab === 'sitemap' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Dominio Base:</label>
              <input
                type="text"
                value={domainBase}
                onChange={(e) => setDomainBase(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-slate-900">URLs en el Sitemap ({sitemapUrls.length})</h3>

              {sitemapUrls.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-12 gap-2 items-center text-xs">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.loc}
                      onChange={(e) => {
                        const upd = [...sitemapUrls];
                        upd[idx].loc = e.target.value;
                        setSitemapUrls(upd);
                      }}
                      placeholder="/ruta-pagina"
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-mono text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      value={item.priority}
                      onChange={(e) => {
                        const upd = [...sitemapUrls];
                        upd[idx].priority = e.target.value;
                        setSitemapUrls(upd);
                      }}
                      className="w-full px-1.5 py-1 bg-white border border-slate-200 rounded text-[11px]"
                    >
                      <option value="1.0">1.0</option>
                      <option value="0.8">0.8</option>
                      <option value="0.6">0.6</option>
                      <option value="0.4">0.4</option>
                      <option value="0.2">0.2</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <select
                      value={item.changefreq}
                      onChange={(e) => {
                        const upd = [...sitemapUrls];
                        upd[idx].changefreq = e.target.value;
                        setSitemapUrls(upd);
                      }}
                      className="w-full px-1.5 py-1 bg-white border border-slate-200 rounded text-[11px]"
                    >
                      <option value="always">always</option>
                      <option value="hourly">hourly</option>
                      <option value="daily">daily</option>
                      <option value="weekly">weekly</option>
                      <option value="monthly">monthly</option>
                      <option value="yearly">yearly</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="date"
                      value={item.lastmod}
                      onChange={(e) => {
                        const upd = [...sitemapUrls];
                        upd[idx].lastmod = e.target.value;
                        setSitemapUrls(upd);
                      }}
                      className="w-full px-1 py-1 bg-white border border-slate-200 rounded text-[10px]"
                    />
                  </div>
                  <div className="col-span-1 text-right">
                    {sitemapUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setSitemapUrls(sitemapUrls.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setSitemapUrls([
                    ...sitemapUrls,
                    { loc: '/nueva-pagina', priority: '0.8', changefreq: 'weekly', lastmod: new Date().toISOString().slice(0, 10) },
                  ])
                }
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir otra URL al sitemap
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-slate-300">sitemap.xml</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copySitemap}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSitemap ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSitemap ? '¡Copiado!' : 'Copiar'}
                </button>
                <button
                  type="button"
                  onClick={() => downloadFile(generateSitemapXml(), 'sitemap.xml', 'application/xml')}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar
                </button>
              </div>
            </div>

            <pre className="p-3.5 bg-slate-950 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed flex-1 max-h-[480px]">
              {generateSitemapXml()}
            </pre>

            <p className="text-[11px] text-slate-400">
              Sube este archivo a la raíz de tu servidor y envíalo en Google Search Console para indexación inmediata.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
