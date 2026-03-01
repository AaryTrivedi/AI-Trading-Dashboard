import type { ImpactAiCategory, ImpactDirection } from '../models/NewsImpactResult.js';

export interface FetchedNewsItem {
  url: string;
  headline: string;
  source?: string;
  publishedAt: Date;
  tickers?: string[];
}

export interface CanonicalNewsItem extends FetchedNewsItem {
  canonicalUrl: string;
  urlHash: string;
}

export interface ExtractedNewsItem extends CanonicalNewsItem {
  content: string;
}

export interface AiImpactResult {
  impact: number;
  direction: ImpactDirection;
  category: ImpactAiCategory;
  points: string[];
  confidence: number;
}

export interface PipelineRunSummary {
  runId: string;
  ingested: number;
  extracted_ok: number;
  skipped_no_content: number;
  ai_ok: number;
  failed: number;
  already_done: number;
}
