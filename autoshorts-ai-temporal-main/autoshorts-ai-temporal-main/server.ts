import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Lazy Google Gen AI helper
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in the environment.');
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Helper to estimate pixel width of a string in typical Google SERP font (Arial 20px for title, 14px for desc)
function estimatePixelWidth(text: string, fontSize = 20): number {
  if (!text) return 0;
  // Approximate average character width multiplier
  const factor = fontSize === 20 ? 10.5 : 7.2;
  return Math.round(text.length * factor);
}

// 1. Audit Live URL or Raw HTML
app.post('/api/seo/audit', async (req, res) => {
  try {
    const { url, rawHtml } = req.body;
    let html = rawHtml || '';
    let targetUrl = url || 'https://ejemplo.com';
    let responseTimeMs = 0;
    let statusCode = 200;

    if (url && !rawHtml) {
      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: 'URL no válida. Debe incluir http:// o https://' });
      }

      const startTime = Date.now();
      const fetchResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        },
        signal: AbortSignal.timeout(12000),
      });
      responseTimeMs = Date.now() - startTime;
      statusCode = fetchResponse.status;
      html = await fetchResponse.text();
    }

    if (!html) {
      return res.status(400).json({ error: 'No se recibió contenido HTML para auditar.' });
    }

    const $ = cheerio.load(html);

    // Extract Title
    const title = $('title').first().text().trim() || '';
    const titleLength = title.length;
    const titlePixelWidth = estimatePixelWidth(title, 20);

    // Extract Meta Description
    const metaDescription = $('meta[name="description" i]').attr('content')?.trim() || '';
    const descLength = metaDescription.length;
    const descPixelWidth = estimatePixelWidth(metaDescription, 14);

    // Meta Robots & Directives
    const robots = $('meta[name="robots" i]').attr('content')?.trim() || '';
    const isNoIndex = robots.toLowerCase().includes('noindex');
    const isNoFollow = robots.toLowerCase().includes('nofollow');

    // Canonical Tag
    const canonical = $('link[rel="canonical" i]').attr('href')?.trim() || '';

    // Headings
    const h1Elements: string[] = [];
    $('h1').each((_, el) => {
      const text = $(el).text().trim();
      if (text) h1Elements.push(text);
    });

    const h2Elements: string[] = [];
    $('h2').each((_, el) => {
      const text = $(el).text().trim();
      if (text) h2Elements.push(text);
    });

    const h3Count = $('h3').length;
    const h4Count = $('h4').length;

    // OpenGraph & Social
    const ogTitle = $('meta[property="og:title" i]').attr('content') || '';
    const ogDescription = $('meta[property="og:description" i]').attr('content') || '';
    const ogImage = $('meta[property="og:image" i]').attr('content') || '';
    const ogUrl = $('meta[property="og:url" i]').attr('content') || '';
    const ogType = $('meta[property="og:type" i]').attr('content') || '';
    const twitterCard = $('meta[name="twitter:card" i]').attr('content') || '';
    const twitterTitle = $('meta[name="twitter:title" i]').attr('content') || '';
    const twitterDescription = $('meta[name="twitter:description" i]').attr('content') || '';
    const twitterImage = $('meta[name="twitter:image" i]').attr('content') || '';

    // Viewport & Mobile
    const viewport = $('meta[name="viewport" i]').attr('content') || '';
    const charset = $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type" i]').attr('content') || '';
    const favicon = $('link[rel*="icon" i]').attr('href') || '';

    // Images & Alt tags
    const images: Array<{ src: string; alt: string; hasAlt: boolean }> = [];
    let imagesWithoutAlt = 0;
    $('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || '';
      const alt = $(el).attr('alt');
      const hasAlt = typeof alt === 'string' && alt.trim().length > 0;
      if (!hasAlt) imagesWithoutAlt++;
      if (images.length < 25) {
        images.push({ src, alt: alt || '', hasAlt });
      }
    });
    const totalImages = $('img').length;

    // Links & Anchor text
    let internalLinksCount = 0;
    let externalLinksCount = 0;
    let nofollowLinksCount = 0;
    const sampleLinks: Array<{ href: string; text: string; isExternal: boolean; isNofollow: boolean }> = [];

    let currentHost = '';
    try {
      currentHost = new URL(targetUrl).hostname;
    } catch {
      // ignore
    }

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href')?.trim() || '';
      const rel = $(el).attr('rel')?.toLowerCase() || '';
      const isNofollow = rel.includes('nofollow');
      if (isNofollow) nofollowLinksCount++;

      let isExternal = false;
      if (href.startsWith('http://') || href.startsWith('https://')) {
        try {
          const linkHost = new URL(href).hostname;
          if (currentHost && linkHost !== currentHost) {
            isExternal = true;
          }
        } catch {
          // ignore
        }
      }

      if (isExternal) {
        externalLinksCount++;
      } else if (!href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        internalLinksCount++;
      }

      if (sampleLinks.length < 20 && href && !href.startsWith('javascript:')) {
        sampleLinks.push({
          href,
          text: $(el).text().trim().slice(0, 60) || '[Sin texto ancla]',
          isExternal,
          isNofollow,
        });
      }
    });

    // Structured Data (JSON-LD)
    const jsonLdScripts: any[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const content = $(el).html();
        if (content) {
          jsonLdScripts.push(JSON.parse(content));
        }
      } catch {
        jsonLdScripts.push({ error: 'JSON-LD malformado' });
      }
    });

    // Text & Content stats
    // Remove scripts, styles
    $('script, style, noscript, svg').remove();
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const words = bodyText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    // Calculate SEO Diagnostics & Scores
    const checks: Array<{
      category: 'meta' | 'content' | 'technical' | 'social';
      title: string;
      status: 'pass' | 'warning' | 'fail';
      message: string;
      scoreWeight: number;
    }> = [];

    // 1. Title Checks
    if (!title) {
      checks.push({
        category: 'meta',
        title: 'Etiqueta Title',
        status: 'fail',
        message: 'Falta la etiqueta <title>. Es el factor on-page más importante.',
        scoreWeight: 15,
      });
    } else if (titleLength < 30) {
      checks.push({
        category: 'meta',
        title: 'Longitud del Title',
        status: 'warning',
        message: `El título es corto (${titleLength} caracteres). Recomendado: entre 50 y 60 caracteres.`,
        scoreWeight: 8,
      });
    } else if (titleLength > 65) {
      checks.push({
        category: 'meta',
        title: 'Longitud del Title',
        status: 'warning',
        message: `El título es largo (${titleLength} caracteres) y podría truncarse en Google SERP (~600px).`,
        scoreWeight: 10,
      });
    } else {
      checks.push({
        category: 'meta',
        title: 'Etiqueta Title',
        status: 'pass',
        message: `Título óptimo (${titleLength} caracteres / ~${titlePixelWidth}px).`,
        scoreWeight: 15,
      });
    }

    // 2. Meta Description Checks
    if (!metaDescription) {
      checks.push({
        category: 'meta',
        title: 'Meta Descripción',
        status: 'fail',
        message: 'No se encontró meta descripción. Los motores de búsqueda generarán un extracto automático.',
        scoreWeight: 12,
      });
    } else if (descLength < 70) {
      checks.push({
        category: 'meta',
        title: 'Longitud de Meta Descripción',
        status: 'warning',
        message: `Meta descripción corta (${descLength} caracteres). Aprovecha entre 120 y 160 caracteres.`,
        scoreWeight: 8,
      });
    } else if (descLength > 165) {
      checks.push({
        category: 'meta',
        title: 'Longitud de Meta Descripción',
        status: 'warning',
        message: `Meta descripción extensa (${descLength} caracteres). Podría truncarse en dispositivos móviles.`,
        scoreWeight: 9,
      });
    } else {
      checks.push({
        category: 'meta',
        title: 'Meta Descripción',
        status: 'pass',
        message: `Meta descripción balanceada (${descLength} caracteres / ~${descPixelWidth}px).`,
        scoreWeight: 12,
      });
    }

    // 3. Headings Structure
    if (h1Elements.length === 0) {
      checks.push({
        category: 'content',
        title: 'Encabezado H1',
        status: 'fail',
        message: 'No existe ningún encabezado <h1> en la página. Cada página debe tener un único H1 temático.',
        scoreWeight: 12,
      });
    } else if (h1Elements.length > 1) {
      checks.push({
        category: 'content',
        title: 'Encabezados H1 Múltiples',
        status: 'warning',
        message: `Se detectaron ${h1Elements.length} etiquetas <h1>. Se recomienda mantener una única <h1> principal.`,
        scoreWeight: 8,
      });
    } else {
      checks.push({
        category: 'content',
        title: 'Encabezado H1',
        status: 'pass',
        message: `Estructura H1 correcta: "${h1Elements[0].slice(0, 50)}..."`,
        scoreWeight: 12,
      });
    }

    if (h2Elements.length === 0) {
      checks.push({
        category: 'content',
        title: 'Subtítulos H2',
        status: 'warning',
        message: 'No se encontraron etiquetas <h2> para estructurar las secciones del contenido.',
        scoreWeight: 6,
      });
    } else {
      checks.push({
        category: 'content',
        title: 'Estructura H2/H3',
        status: 'pass',
        message: `Jerarquía clara con ${h2Elements.length} H2 y ${h3Count} H3.`,
        scoreWeight: 8,
      });
    }

    // 4. Word Count
    if (wordCount < 300) {
      checks.push({
        category: 'content',
        title: 'Volumen de Contenido',
        status: 'warning',
        message: `Contenido escaso (${wordCount} palabras). Podría clasificarse como thin content para consultas competitivas.`,
        scoreWeight: 8,
      });
    } else {
      checks.push({
        category: 'content',
        title: 'Volumen de Contenido',
        status: 'pass',
        message: `Buen volumen de texto (${wordCount} palabras, ~${readingTimeMinutes} min de lectura).`,
        scoreWeight: 10,
      });
    }

    // 5. Image Alt attributes
    if (totalImages === 0) {
      checks.push({
        category: 'content',
        title: 'Imágenes',
        status: 'pass',
        message: 'No hay imágenes que requieran etiquetas ALT.',
        scoreWeight: 5,
      });
    } else if (imagesWithoutAlt > 0) {
      checks.push({
        category: 'content',
        title: 'Texto Alternativo (ALT)',
        status: imagesWithoutAlt === totalImages ? 'fail' : 'warning',
        message: `${imagesWithoutAlt} de ${totalImages} imágenes carecen de atributo alt descriptivo.`,
        scoreWeight: 8,
      });
    } else {
      checks.push({
        category: 'content',
        title: 'Texto Alternativo (ALT)',
        status: 'pass',
        message: `Todas las ${totalImages} imágenes incluyen atributo alt.`,
        scoreWeight: 8,
      });
    }

    // 6. Technical & Indexability
    if (isNoIndex) {
      checks.push({
        category: 'technical',
        title: 'Directiva Robots',
        status: 'fail',
        message: 'Alerta crítica: la etiqueta meta robots contiene "noindex". Esta página no aparecerá en Google.',
        scoreWeight: 0,
      });
    } else {
      checks.push({
        category: 'technical',
        title: 'Indexabilidad',
        status: 'pass',
        message: 'La página permite indexación por motores de búsqueda.',
        scoreWeight: 10,
      });
    }

    if (!canonical) {
      checks.push({
        category: 'technical',
        title: 'Etiqueta Canónica',
        status: 'warning',
        message: 'No se definió <link rel="canonical">. Es recomendable para evitar problemas de contenido duplicado.',
        scoreWeight: 6,
      });
    } else {
      checks.push({
        category: 'technical',
        title: 'Etiqueta Canónica',
        status: 'pass',
        message: `URL canónica configurada: ${canonical.slice(0, 50)}...`,
        scoreWeight: 8,
      });
    }

    if (!viewport) {
      checks.push({
        category: 'technical',
        title: 'Optimización Móvil (Viewport)',
        status: 'fail',
        message: 'Falta la etiqueta meta viewport. El sitio no es responsive para Google Mobile-First Indexing.',
        scoreWeight: 5,
      });
    } else {
      checks.push({
        category: 'technical',
        title: 'Mobile Friendly',
        status: 'pass',
        message: 'Meta viewport detectado y configurado.',
        scoreWeight: 8,
      });
    }

    // 7. Social & Rich Schema
    if (!ogTitle || !ogDescription || !ogImage) {
      checks.push({
        category: 'social',
        title: 'Open Graph (Facebook/LinkedIn)',
        status: 'warning',
        message: 'Faltan etiquetas Open Graph clave (og:title, og:description o og:image) para previsualizaciones en redes.',
        scoreWeight: 5,
      });
    } else {
      checks.push({
        category: 'social',
        title: 'Open Graph',
        status: 'pass',
        message: 'Etiquetas Open Graph completas con imagen, título y descripción.',
        scoreWeight: 8,
      });
    }

    if (jsonLdScripts.length === 0) {
      checks.push({
        category: 'technical',
        title: 'Datos Estructurados (Schema)',
        status: 'warning',
        message: 'No se detectó Schema JSON-LD. Añadir datos estructurados mejora los Rich Snippets en Google.',
        scoreWeight: 6,
      });
    } else {
      checks.push({
        category: 'technical',
        title: 'Datos Estructurados (Schema)',
        status: 'pass',
        message: `Se encontraron ${jsonLdScripts.length} bloque(s) de marcado JSON-LD.`,
        scoreWeight: 8,
      });
    }

    // Compute Overall Score (0 - 100)
    let totalScore = 0;
    let maxPossible = 0;
    checks.forEach((c) => {
      maxPossible += c.scoreWeight;
      if (c.status === 'pass') totalScore += c.scoreWeight;
      else if (c.status === 'warning') totalScore += c.scoreWeight * 0.5;
    });
    const finalScore = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 50;

    res.json({
      url: targetUrl,
      statusCode,
      responseTimeMs,
      overallScore: finalScore,
      title,
      titleLength,
      titlePixelWidth,
      metaDescription,
      descLength,
      descPixelWidth,
      canonical,
      robots,
      isNoIndex,
      isNoFollow,
      headings: {
        h1: h1Elements,
        h2: h2Elements,
        h3Count,
        h4Count,
      },
      content: {
        wordCount,
        readingTimeMinutes,
        textSnippet: bodyText.slice(0, 300),
      },
      images: {
        total: totalImages,
        withoutAlt: imagesWithoutAlt,
        sample: images,
      },
      links: {
        internal: internalLinksCount,
        external: externalLinksCount,
        nofollow: nofollowLinksCount,
        sample: sampleLinks,
      },
      social: {
        ogTitle,
        ogDescription,
        ogImage,
        ogUrl,
        ogType,
        twitterCard,
        twitterTitle,
        twitterDescription,
        twitterImage,
      },
      technical: {
        viewport,
        charset,
        hasFavicon: Boolean(favicon),
        jsonLdCount: jsonLdScripts.length,
        jsonLd: jsonLdScripts,
      },
      checks,
    });
  } catch (error: any) {
    console.error('Error auditing SEO:', error);
    res.status(500).json({
      error: error?.message || 'Error al analizar la URL. Asegúrate de que el sitio sea público y accesible.',
    });
  }
});

// 2. AI Meta Tag & SERP Optimizer (Powered by Gemini)
app.post('/api/seo/ai-meta', async (req, res) => {
  try {
    const { topic, currentTitle, currentDescription, targetKeyword, language = 'es' } = req.body;
    if (!topic && !currentTitle && !targetKeyword) {
      return res.status(400).json({ error: 'Debes proporcionar un tema, palabra clave o título actual.' });
    }

    const ai = getGenAI();
    const prompt = `Eres un consultor SEO senior y copywriter de conversión de alto nivel.
Genera títulos (Title Tags) y meta descripciones altamente optimizados para Google SERP y CTR orgánico, basados en la siguiente información:
- Tema / URL: ${topic || 'No especificado'}
- Título actual: ${currentTitle || 'Ninguno'}
- Meta descripción actual: ${currentDescription || 'Ninguna'}
- Palabra clave principal: ${targetKeyword || 'No especificada'}
- Idioma: ${language}

Requisitos técnicos estrictos:
1. Longitud de cada Title: entre 50 y 60 caracteres (máximo 600px). Debe incluir la palabra clave hacia la izquierda y ser magnético sin caer en clickbait barato.
2. Longitud de cada Meta Description: entre 135 y 155 caracteres. Debe incluir la intención de búsqueda, beneficio claro y un Call To Action (CTA).
3. Sugerir 3 variaciones con diferentes enfoques: (1) Enfoque Directo / Autoridad, (2) Enfoque Beneficio / Solución rápida, (3) Enfoque Pregunta / Curiosidad.
4. Proporcionar también sugerencias de palabras clave secundarias y etiqueta Open Graph recomendada.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            variations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  angleName: { type: Type.STRING },
                  title: { type: Type.STRING },
                  titleCharCount: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                  descriptionCharCount: { type: Type.NUMBER },
                  ctrReasoning: { type: Type.STRING },
                },
                required: ['angleName', 'title', 'titleCharCount', 'description', 'descriptionCharCount', 'ctrReasoning'],
              },
            },
            secondaryKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            openGraphRecommendation: {
              type: Type.OBJECT,
              properties: {
                ogTitle: { type: Type.STRING },
                ogDescription: { type: Type.STRING },
                suggestedImageType: { type: Type.STRING },
              },
              required: ['ogTitle', 'ogDescription'],
            },
          },
          required: ['variations', 'secondaryKeywords'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating AI meta tags:', error);
    res.status(500).json({ error: error?.message || 'Error al generar meta tags con IA.' });
  }
});

// 3. AI Keyword Research & Search Intent Analyzer
app.post('/api/seo/keyword-research', async (req, res) => {
  try {
    const { keyword, country = 'España / Latam', language = 'es' } = req.body;
    if (!keyword) {
      return res.status(400).json({ error: 'Por favor ingresa una palabra clave o término semilla.' });
    }

    const ai = getGenAI();
    const prompt = `Actúa como una herramienta profesional de Keyword Intelligence SEO (estilo Ahrefs / Semrush).
Analiza el siguiente término clave semilla: "${keyword}".
País/Región: ${country}.
Idioma: ${language}.

Proporciona un análisis completo con:
1. Intención de búsqueda predominante (Informacional, Navegacional, Comercial, Transaccional).
2. Dificultad estimada (Fácil, Media, Alta) y Volumen relativo (Nicho, Medio, Alto).
3. Lista de 10 palabras clave relacionadas y long-tail derivadas con su intención, dificultad y enfoque de contenido.
4. Lista de 6 preguntas frecuentes que la gente busca en Google (People Also Ask / PAA) para este tema.
5. Lista de entidades semánticas / palabras LSI que Google espera ver en un artículo posicionado para este término.
6. Recomendación estratégica de formato de contenido recomendado (Guía paso a paso, Comparativa, Lista de herramientas, etc.).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            seedKeyword: { type: Type.STRING },
            primaryIntent: { type: Type.STRING },
            overallDifficulty: { type: Type.STRING },
            volumeTier: { type: Type.STRING },
            strategicSummary: { type: Type.STRING },
            recommendedFormat: { type: Type.STRING },
            relatedKeywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  keyword: { type: Type.STRING },
                  intent: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  volume: { type: Type.STRING },
                  opportunity: { type: Type.STRING },
                },
                required: ['keyword', 'intent', 'difficulty', 'volume'],
              },
            },
            questionsPAA: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            semanticEntitiesLSI: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['seedKeyword', 'primaryIntent', 'strategicSummary', 'relatedKeywords', 'questionsPAA', 'semanticEntitiesLSI'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error conducting keyword research:', error);
    res.status(500).json({ error: error?.message || 'Error al analizar palabras clave.' });
  }
});

// 4. Content SEO Reviewer & Assistant
app.post('/api/seo/content-advisor', async (req, res) => {
  try {
    const { content, targetKeyword, language = 'es' } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Proporciona el texto o borrador a evaluar.' });
    }

    const ai = getGenAI();
    const prompt = `Analiza el siguiente contenido desde una perspectiva rigurosa de SEO On-Page y redacción semántica:
- Palabra clave objetivo: "${targetKeyword || 'General'}"
- Idioma: ${language}
- Contenido:
"""
${content.slice(0, 10000)}
"""

Entrega:
1. Puntuación SEO del contenido (0 a 100).
2. Evaluación de legibilidad y tono.
3. Lista de puntos fuertes (qué está bien hecho).
4. Lista de mejoras prioritarias y accionables (ej: estructura de H2/H3, densidad de palabras, llamadas a la acción, falta de tablas o listas).
5. Lista de 5 términos semánticos faltantes que enriquecerían el contenido para los algoritmos NLP de Google.
6. 3 preguntas con respuestas breves recomendadas para agregar una sección FAQ de Rich Snippets.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            contentScore: { type: Type.NUMBER },
            readabilityGrade: { type: Type.STRING },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            criticalImprovements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            missingSemanticKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestedFaqs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING },
                },
                required: ['question', 'answer'],
              },
            },
          },
          required: ['contentScore', 'readabilityGrade', 'strengths', 'criticalImprovements', 'missingSemanticKeywords', 'suggestedFaqs'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error advising content:', error);
    res.status(500).json({ error: error?.message || 'Error al auditar el contenido.' });
  }
});

// Vite Middleware or Static Files
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
