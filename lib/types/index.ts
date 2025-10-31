import { LlmProvider, FindingKind, ProjectStatus } from '@prisma/client';

// Brand Analysis Types
export interface BrandSynopsis {
  summary: string;
  pillars: PositioningPillar[];
  toneOfVoice: ToneOfVoice;
  segments: BuyerSegment[];
  amenities: AmenityClaim[];
  trustSignals: TrustSignal[];
}

export interface PositioningPillar {
  name: string;
  description: string;
  evidence: string;
  sourceUrl?: string;
}

export interface ToneOfVoice {
  adjectives: string[];
  exampleSentence: string;
  readingLevel?: string;
}

export interface BuyerSegment {
  name: string;
  description: string;
  reasoning: string;
}

export interface AmenityClaim {
  name: string;
  type: 'stated' | 'implied';
  description: string;
  evidence: string;
}

export interface TrustSignal {
  type: 'testimonial' | 'certification' | 'award' | 'data' | 'press' | 'warranty';
  description: string;
  source?: string;
}

// Consensus Analysis
export interface ConsensusAnalysis {
  agreementIndex: number; // 0-100
  commonThemes: string[];
  divergences: Divergence[];
}

export interface Divergence {
  topic: string;
  modelPerspectives: {
    provider: LlmProvider;
    view: string;
    evidence: string;
  }[];
  explanation: string;
}

// Competitive Analysis
export interface CompetitivePosition {
  name: string;
  url: string;
  positioning: {
    x: number; // e.g., Design ↔ Value
    y: number; // e.g., Lifestyle ↔ Performance
  };
  tagline?: string;
  keyDifferentiator?: string;
}

export interface PositioningGrid {
  axes: {
    x: { label: string; min: string; max: string };
    y: { label: string; min: string; max: string };
  };
  subject: CompetitivePosition;
  competitors: CompetitivePosition[];
  whiteSpace: string[];
  claimOverlaps: string[];
}

// Messaging Heuristics
export interface MessagingScores {
  clarity: HeuristicScore;
  specificity: HeuristicScore;
  differentiation: HeuristicScore;
  trust: HeuristicScore;
}

export interface HeuristicScore {
  level: 'low' | 'medium' | 'high';
  score: number; // 0-100
  rationale: string;
  evidence: string[];
  recommendations: string[];
}

// Recommendations
export interface Recommendation {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'S' | 'M' | 'L';
  category: 'copy' | 'content' | 'proof' | 'structure' | 'faq';
  before?: string;
  after?: string;
  evidence?: string;
}

// Human vs LLM
export interface HumanVsLlmComparison {
  humanStatement: string;
  llmConsensus: string;
  alignment: {
    strengths: string[];
    gaps: string[];
  };
  suggestedEdits: {
    section: string;
    currentText: string;
    suggestedText: string;
    reasoning: string;
  }[];
}

// Complete Report
export interface BrandAuditReport {
  projectId: string;
  url: string;
  region?: string;
  generatedAt: Date;

  executiveSummary: {
    overview: string;
    topActions: Recommendation[];
  };

  modelPerspectives: {
    provider: LlmProvider;
    model: string;
    synopsis: BrandSynopsis;
  }[];

  consensus: ConsensusAnalysis;
  positioning: PositioningGrid;
  messaging: MessagingScores;
  recommendations: Recommendation[];

  humanVsLlm?: HumanVsLlmComparison;

  metadata: {
    pagesAnalyzed: number;
    tokensUsed: number;
    cost: number;
    processingTime: number;
  };
}

// API Types
export interface CreateProjectRequest {
  url: string;
  region?: string;
  humanBrandStatement?: string;
}

export interface ProjectResponse {
  id: string;
  url: string;
  status: ProjectStatus;
  reportUrl?: string;
}

// LLM Provider Types
export interface LLMConfig {
  provider: LlmProvider;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface LLMResponse<T = any> {
  provider: LlmProvider;
  model: string;
  content: T;
  tokensUsed: number;
  cost?: number;
  raw: any;
}

// Scraping Types
export interface ScrapedPage {
  url: string;
  type: string;
  title: string;
  content: string;
  excerpt: string;
  metadata: {
    description?: string;
    keywords?: string[];
    ogTitle?: string;
    ogDescription?: string;
  };
}

export interface ScrapeResult {
  mainPage: ScrapedPage;
  subPages: ScrapedPage[];
  error?: string;
}
