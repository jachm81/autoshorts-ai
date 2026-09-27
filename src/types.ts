export type SeoTab =
  | 'audit'
  | 'serp'
  | 'keywords'
  | 'schema'
  | 'robots-sitemap'
  | 'content';

export interface SeoCheck {
  category: 'meta' | 'content' | 'technical' | 'social';
  title: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  scoreWeight: number;
}

export interface SeoAuditResult {
  url: string;
  statusCode: number;
  responseTimeMs: number;
  overallScore: number;
  title: string;
  titleLength: number;
  titlePixelWidth: number;
  metaDescription: string;
  descLength: number;
  descPixelWidth: number;
  canonical: string;
  robots: string;
  isNoIndex: boolean;
  isNoFollow: boolean;
  headings: {
    h1: string[];
    h2: string[];
    h3Count: number;
    h4Count: number;
  };
  content: {
    wordCount: number;
    readingTimeMinutes: number;
    textSnippet: string;
  };
  images: {
    total: number;
    withoutAlt: number;
    sample: Array<{ src: string; alt: string; hasAlt: boolean }>;
  };
  links: {
    internal: number;
    external: number;
    nofollow: number;
    sample: Array<{ href: string; text: string; isExternal: boolean; isNofollow: boolean }>;
  };
  social: {
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    ogUrl: string;
    ogType: string;
    twitterCard: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;
  };
  technical: {
    viewport: string;
    charset: string;
    hasFavicon: boolean;
    jsonLdCount: number;
    jsonLd: any[];
  };
  checks: SeoCheck[];
}

export interface MetaVariation {
  angleName: string;
  title: string;
  titleCharCount: number;
  description: string;
  descriptionCharCount: number;
  ctrReasoning: string;
}

export interface AiMetaResult {
  variations: MetaVariation[];
  secondaryKeywords: string[];
  openGraphRecommendation: {
    ogTitle: string;
    ogDescription: string;
    suggestedImageType: string;
  };
}

export interface KeywordItem {
  keyword: string;
  intent: string;
  difficulty: string;
  volume: string;
  opportunity?: string;
}

export interface KeywordResearchResult {
  seedKeyword: string;
  primaryIntent: string;
  overallDifficulty: string;
  volumeTier: string;
  strategicSummary: string;
  recommendedFormat: string;
  relatedKeywords: KeywordItem[];
  questionsPAA: string[];
  semanticEntitiesLSI: string[];
}

export interface ContentAdvisorResult {
  contentScore: number;
  readabilityGrade: string;
  strengths: string[];
  criticalImprovements: string[];
  missingSemanticKeywords: string[];
  suggestedFaqs: Array<{
    question: string;
    answer: string;
  }>;
}
