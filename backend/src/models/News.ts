import mongoose from 'mongoose';

export const IMPACT_CATEGORIES = ['none', 'low', 'med', 'high', 'very_high'] as const;
export const IMPACT_TYPES = ['positive', 'negative', 'mixed'] as const;

export type ImpactCategory = (typeof IMPACT_CATEGORIES)[number];
export type ImpactType = (typeof IMPACT_TYPES)[number];

export interface INews {
  _id: mongoose.Types.ObjectId;
  url: string;
  title: string;
  publishedAt: Date;
  source?: string;
  tickers: string[];
  aiSummary: string;
  impactCategory: ImpactCategory;
  impactType: ImpactType;
  createdAt: Date;
}

const NewsSchema = new mongoose.Schema<INews>(
  {
    url: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    publishedAt: {
      type: Date,
      required: true,
      index: true,
    },
    source: {
      type: String,
      trim: true,
    },
    tickers: {
      type: [String],
      default: [],
      index: true,
    },
    aiSummary: {
      type: String,
      required: true,
      default: '',
    },
    impactCategory: {
      type: String,
      required: true,
      enum: IMPACT_CATEGORIES,
      default: 'none',
    },
    impactType: {
      type: String,
      required: true,
      enum: IMPACT_TYPES,
      default: 'mixed',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

// Indexes: url (unique via schema), tickers, publishedAt
NewsSchema.index({ tickers: 1 });
NewsSchema.index({ publishedAt: -1 });

export const News = mongoose.model<INews>('News', NewsSchema);
