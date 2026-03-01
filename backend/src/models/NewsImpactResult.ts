import mongoose from 'mongoose';

export const IMPACT_DIRECTIONS = ['positive', 'negative', 'mixed', 'unclear'] as const;
export const IMPACT_AI_CATEGORIES = [
  'EARNINGS',
  'MERGER_ACQUISITION',
  'REGULATORY_LEGAL',
  'MACRO',
  'ANALYST_RATING',
  'PRODUCT',
  'MANAGEMENT_CHANGE',
  'SUPPLY_CHAIN',
  'INSIDER_TRADING',
  'OTHER',
] as const;

export type ImpactDirection = (typeof IMPACT_DIRECTIONS)[number];
export type ImpactAiCategory = (typeof IMPACT_AI_CATEGORIES)[number];

export interface INewsImpactResult {
  _id: mongoose.Types.ObjectId;
  url_hash: string;
  url: string;
  canonical_url: string;
  headline: string;
  impact: number;
  direction: ImpactDirection;
  category: ImpactAiCategory;
  points: string[];
  confidence: number;
  model: string;
  prompt_version: string;
  created_at: Date;
}

const NewsImpactResultSchema = new mongoose.Schema<INewsImpactResult>(
  {
    url_hash: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    canonical_url: {
      type: String,
      required: true,
      trim: true,
    },
    headline: {
      type: String,
      required: true,
      trim: true,
    },
    impact: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    direction: {
      type: String,
      required: true,
      enum: IMPACT_DIRECTIONS,
    },
    category: {
      type: String,
      required: true,
      enum: IMPACT_AI_CATEGORIES,
    },
    points: {
      type: [String],
      required: true,
      default: [],
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    prompt_version: {
      type: String,
      required: true,
      trim: true,
    },
    created_at: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    collection: 'news_results',
    versionKey: false,
    timestamps: false,
  }
);

NewsImpactResultSchema.index({ url_hash: 1 }, { unique: true });

export const NewsImpactResult = mongoose.model<INewsImpactResult>('NewsImpactResult', NewsImpactResultSchema);
