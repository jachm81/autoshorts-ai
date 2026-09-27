import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  ExternalLink, 
  Plus, 
  Trash2, 
  FileText, 
  Store, 
  ShoppingBag, 
  HelpCircle, 
  ListOrdered,
  Building2,
  FolderTree
} from 'lucide-react';

type SchemaType = 'faq' | 'article' | 'localBusiness' | 'product' | 'howTo' | 'organization' | 'breadcrumbs';

export const SchemaTool: React.FC = () => {
  const [activeSchema, setActiveSchema] = useState<SchemaType>('faq');
  const [copied, setCopied] = useState(false);

  // 1. FAQ State
  const [faqs, setFaqs] = useState([
    {
      q: '¿Qué es el SEO y por qué es importante?',
      a: 'El SEO (Search Engine Optimization) es el conjunto de técnicas para mejorar la visibilidad de una web en los resultados orgánicos de buscadores como Google.',
    },
    {
      q: '¿Cuánto tiempo tarda en verse resultados SEO?',
      a: 'Generalmente se observan resultados significativos entre 3 y 6 meses, dependiendo de la competencia del sector y la autoridad del dominio.',
    },
  ]);

  // 2. Article State
  const [article, setArticle] = useState({
    headline: 'Guía Completa de SEO On-Page para 2026',
    author: 'Carlos Gómez',
    publisher: 'Agencia SEO Digital',
    publisherLogo: 'https://ejemplo.com/logo.png',
    datePublished: '2026-03-15',
    dateModified: '2026-03-20',
    description: 'Aprende paso a paso cómo optimizar tus etiquetas title, meta descriptions, encabezados H1-H3 y velocidad web.',
    image: 'https://ejemplo.com/imagenes/seo-guia.jpg',
    url: 'https://ejemplo.com/blog/guia-seo',
  });

  // 3. Local Business State
  const [business, setBusiness] = useState({
    name: 'Restaurante El Gourmet',
    type: 'Restaurant',
    streetAddress: 'Calle Gran Vía 45',
    addressLocality: 'Madrid',
    postalCode: '28013',
    addressCountry: 'ES',
    telephone: '+34 912 345 678',
    priceRange: '€€',
    image: 'https://ejemplo.com/restaurante.jpg',
    url: 'https://elgourmetmadrid.es',
  });

  // 4. Product State
  const [product, setProduct] = useState({
    name: 'Zapatillas Deportivas Pro Runner X',
    description: 'Calzado ligero con amortiguación de última generación para carreras de fondo.',
    brand: 'AeroSport',
    sku: 'AERO-RUN-2026',
    price: '89.99',
    currency: 'EUR',
    availability: 'https://schema.org/InStock',
    ratingValue: '4.8',
    reviewCount: '124',
    image: 'https://ejemplo.com/zapatillas.jpg',
  });

  // 5. HowTo State
  const [howTo, setHowTo] = useState({
    name: 'Cómo hacer una auditoría SEO en 5 minutos',
    description: 'Guía rápida para auditar los factores on-page esenciales de cualquier sitio web.',
    totalTime: 'PT5M',
    steps: [
      { name: 'Paso 1: Analizar etiqueta Title', text: 'Verifica que contenga la palabra clave principal y no supere los 60 caracteres.' },
      { name: 'Paso 2: Revisar encabezados H1-H2', text: 'Comprueba que exista un único H1 y subtítulos lógicos organizados.' },
      { name: 'Paso 3: Inspeccionar textos ALT', text: 'Asegúrate de que todas las imágenes describan su contenido.' },
    ],
  });

  // 6. Organization State
  const [organization, setOrganization] = useState({
    name: 'TechSoluciones S.L.',
    url: 'https://techsoluciones.es',
    logo: 'https://techsoluciones.es/logo.png',
    contactPoint: '+34 900 100 200',
    sameAs: 'https://twitter.com/techsoluciones\nhttps://linkedin.com/company/techsoluciones',
  });

  // 7. Breadcrumbs State
  const [breadcrumbs, setBreadcrumbs] = useState([
    { name: 'Inicio', url: 'https://ejemplo.com/' },
    { name: 'Blog', url: 'https://ejemplo.com/blog' },
    { name: 'Guía SEO', url: 'https://ejemplo.com/blog/guia-seo' },
  ]);

  // Generate JSON-LD based on active schema
  const generateJsonLd = () => {
    let schemaObj: any = {};

    switch (activeSchema) {
      case 'faq':
        schemaObj = {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.a,
            },
          })),
        };
        break;

      case 'article':
        schemaObj = {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: article.headline,
          description: article.description,
          image: article.image ? [article.image] : undefined,
          datePublished: article.datePublished,
          dateModified: article.dateModified,
          author: [{
            '@type': 'Person',
            name: article.author,
          }],
          publisher: {
            '@type': 'Organization',
            name: article.publisher,
            logo: article.publisherLogo ? {
              '@type': 'ImageObject',
              url: article.publisherLogo,
            } : undefined,
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': article.url,
          },
        };
        break;

      case 'localBusiness':
        schemaObj = {
          '@context': 'https://schema.org',
          '@type': business.type || 'LocalBusiness',
          name: business.name,
          image: business.image || undefined,
          '@id': business.url,
          url: business.url,
          telephone: business.telephone,
          priceRange: business.priceRange,
          address: {
            '@type': 'PostalAddress',
            streetAddress: business.streetAddress,
            addressLocality: business.addressLocality,
            postalCode: business.postalCode,
            addressCountry: business.addressCountry,
          },
        };
        break;

      case 'product':
        schemaObj = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          image: product.image ? [product.image] : undefined,
          description: product.description,
          sku: product.sku,
          brand: {
            '@type': 'Brand',
            name: product.brand,
          },
          offers: {
            '@type': 'Offer',
            priceCurrency: product.currency,
            price: product.price,
            availability: product.availability,
            url: window.location.href,
          },
          aggregateRating: product.ratingValue ? {
            '@type': 'AggregateRating',
            ratingValue: product.ratingValue,
            reviewCount: product.reviewCount,
          } : undefined,
        };
        break;

      case 'howTo':
        schemaObj = {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: howTo.name,
          description: howTo.description,
          totalTime: howTo.totalTime,
          step: howTo.steps.map((s, idx) => ({
            '@type': 'HowToStep',
            position: idx + 1,
            name: s.name,
            text: s.text,
          })),
        };
        break;

      case 'organization':
        schemaObj = {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: organization.name,
          url: organization.url,
          logo: organization.logo,
          sameAs: organization.sameAs.split('\n').filter(Boolean),
        };
        break;

      case 'breadcrumbs':
        schemaObj = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs.map((b, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: b.name,
            item: b.url,
          })),
        };
        break;
    }

    return JSON.stringify(schemaObj, null, 2);
  };

  const getFullScriptTag = () => {
    return `<script type="application/ld+json">\n${generateJsonLd()}\n</script>`;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(getFullScriptTag());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Schema Type Navigation */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Generador de Marcado Schema JSON-LD
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Crea datos estructurados validados por Google para activar Rich Snippets y destacar en SERP
            </p>
          </div>
          <a
            href="https://search.google.com/test/rich-results"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
          >
            <span>Probar en Google Rich Results</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
          {[
            { id: 'faq' as SchemaType, label: 'FAQ Preguntas', icon: HelpCircle },
            { id: 'article' as SchemaType, label: 'Artículo / Blog', icon: FileText },
            { id: 'product' as SchemaType, label: 'Producto & Precios', icon: ShoppingBag },
            { id: 'localBusiness' as SchemaType, label: 'Negocio Local', icon: Store },
            { id: 'howTo' as SchemaType, label: 'Guía HowTo', icon: ListOrdered },
            { id: 'organization' as SchemaType, label: 'Organización', icon: Building2 },
            { id: 'breadcrumbs' as SchemaType, label: 'Migas de Pan', icon: FolderTree },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSchema === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSchema(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Configuración de {activeSchema.toUpperCase()}
          </h3>

          {/* Form Fields according to schema */}
          {activeSchema === 'faq' && (
            <div className="space-y-4">
              {faqs.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Pregunta #{idx + 1}</span>
                    {faqs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Eliminar pregunta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={item.q}
                    onChange={(e) => {
                      const updated = [...faqs];
                      updated[idx].q = e.target.value;
                      setFaqs(updated);
                    }}
                    placeholder="Escribe la pregunta exacta..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                  />
                  <textarea
                    rows={2}
                    value={item.a}
                    onChange={(e) => {
                      const updated = [...faqs];
                      updated[idx].a = e.target.value;
                      setFaqs(updated);
                    }}
                    placeholder="Respuesta concisa y directa..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() => setFaqs([...faqs, { q: '', a: '' }])}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir otra pregunta FAQ
              </button>
            </div>
          )}

          {activeSchema === 'article' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Titular (Headline)</label>
                <input
                  type="text"
                  value={article.headline}
                  onChange={(e) => setArticle({ ...article, headline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Autor</label>
                  <input
                    type="text"
                    value={article.author}
                    onChange={(e) => setArticle({ ...article, author: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Editor / Sitio</label>
                  <input
                    type="text"
                    value={article.publisher}
                    onChange={(e) => setArticle({ ...article, publisher: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Fecha Publicación</label>
                  <input
                    type="date"
                    value={article.datePublished}
                    onChange={(e) => setArticle({ ...article, datePublished: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Fecha Modificación</label>
                  <input
                    type="date"
                    value={article.dateModified}
                    onChange={(e) => setArticle({ ...article, dateModified: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">URL de la Imagen Principal</label>
                <input
                  type="url"
                  value={article.image}
                  onChange={(e) => setArticle({ ...article, image: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          )}

          {activeSchema === 'product' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Precio</label>
                  <input
                    type="text"
                    value={product.price}
                    onChange={(e) => setProduct({ ...product, price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Moneda</label>
                  <input
                    type="text"
                    value={product.currency}
                    onChange={(e) => setProduct({ ...product, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Marca</label>
                  <input
                    type="text"
                    value={product.brand}
                    onChange={(e) => setProduct({ ...product, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Puntuación Promedio (0-5)</label>
                  <input
                    type="text"
                    value={product.ratingValue}
                    onChange={(e) => setProduct({ ...product, ratingValue: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Número de Reseñas</label>
                  <input
                    type="number"
                    value={product.reviewCount}
                    onChange={(e) => setProduct({ ...product, reviewCount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSchema === 'localBusiness' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  value={business.name}
                  onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Dirección (Calle)</label>
                  <input
                    type="text"
                    value={business.streetAddress}
                    onChange={(e) => setBusiness({ ...business, streetAddress: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ciudad / Localidad</label>
                  <input
                    type="text"
                    value={business.addressLocality}
                    onChange={(e) => setBusiness({ ...business, addressLocality: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={business.telephone}
                    onChange={(e) => setBusiness({ ...business, telephone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Rango de Precios (€, €€, €€€)</label>
                  <input
                    type="text"
                    value={business.priceRange}
                    onChange={(e) => setBusiness({ ...business, priceRange: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSchema === 'howTo' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Título de la Guía</label>
                <input
                  type="text"
                  value={howTo.name}
                  onChange={(e) => setHowTo({ ...howTo, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-3">
                {howTo.steps.map((st, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Paso #{i + 1}</span>
                      {howTo.steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setHowTo({ ...howTo, steps: howTo.steps.filter((_, idx) => idx !== i) })}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={st.name}
                      onChange={(e) => {
                        const s = [...howTo.steps];
                        s[i].name = e.target.value;
                        setHowTo({ ...howTo, steps: s });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
                      placeholder="Nombre del paso..."
                    />
                    <textarea
                      rows={2}
                      value={st.text}
                      onChange={(e) => {
                        const s = [...howTo.steps];
                        s[i].text = e.target.value;
                        setHowTo({ ...howTo, steps: s });
                      }}
                      className="w-full p-2 bg-white border border-slate-200 rounded text-xs"
                      placeholder="Descripción detallada de la acción..."
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setHowTo({ ...howTo, steps: [...howTo.steps, { name: '', text: '' }] })}
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Añadir otro paso
                </button>
              </div>
            </div>
          )}

          {activeSchema === 'breadcrumbs' && (
            <div className="space-y-3 text-xs">
              {breadcrumbs.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-600 shrink-0">
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    value={b.name}
                    onChange={(e) => {
                      const upd = [...breadcrumbs];
                      upd[i].name = e.target.value;
                      setBreadcrumbs(upd);
                    }}
                    placeholder="Texto de la miga (ej: Inicio)"
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={b.url}
                    onChange={(e) => {
                      const upd = [...breadcrumbs];
                      upd[i].url = e.target.value;
                      setBreadcrumbs(upd);
                    }}
                    placeholder="URL de destino"
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                  {breadcrumbs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setBreadcrumbs(breadcrumbs.filter((_, idx) => idx !== i))}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => setBreadcrumbs([...breadcrumbs, { name: '', url: '' }])}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir nivel de miga
              </button>
            </div>
          )}

          {activeSchema === 'organization' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nombre Oficial</label>
                <input
                  type="text"
                  value={organization.name}
                  onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">URL Principal</label>
                <input
                  type="url"
                  value={organization.url}
                  onChange={(e) => setOrganization({ ...organization, url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">URL del Logo (PNG/SVG)</label>
                <input
                  type="url"
                  value={organization.logo}
                  onChange={(e) => setOrganization({ ...organization, logo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Perfiles Sociales (uno por línea)</label>
                <textarea
                  rows={3}
                  value={organization.sameAs}
                  onChange={(e) => setOrganization({ ...organization, sameAs: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right JSON-LD Output (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs">
              <Code2 className="w-4 h-4" />
              <span>&lt;script type="application/ld+json"&gt;</span>
            </div>

            <button
              type="button"
              id="btn-copy-schema-json"
              onClick={copyCode}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '¡Copiado!' : 'Copiar Marcado'}
            </button>
          </div>

          <pre className="p-3 bg-slate-950 text-emerald-300 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed flex-1 max-h-[480px]">
            {generateJsonLd()}
          </pre>

          <p className="text-[11px] text-slate-400">
            💡 Pega este fragmento dentro del bloque <code className="text-slate-200 font-mono">&lt;head&gt;</code> o antes del cierre de <code className="text-slate-200 font-mono">&lt;/body&gt;</code> en tu HTML.
          </p>
        </div>
      </div>
    </div>
  );
};
