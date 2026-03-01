import mongoose from 'mongoose';

export interface INewsRawIngest {
  _id: mongoose.Types.ObjectId;
  url_hash: string;
  url: string;
  canonical_url: string;
  headline: string;
  source?: string;
  published_at: Date;
  tickers: string[];
  fetched_at: Date;
}

const NewsRawIngestSchema = new mongoose.Schema<INewsRawIngest>(
  {
    url_hash: {
      type: String,
      required: true,
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
    source: {
      type: String,
      trim: true,
    },
    published_at: {
      type: Date,
      required: true,
      index: true,
    },
    tickers: {
      type: [String],
      default: [],
      index: true,
    },
    fetched_at: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    collection: 'news_raw',
    versionKey: false,
    timestamps: false,
  }
);

NewsRawIngestSchema.index({ published_at: -1 });
NewsRawIngestSchema.index({ source: 1 });
NewsRawIngestSchema.index({ tickers: 1 });

export const NewsRawIngest = mongoose.model<INewsRawIngest>('NewsRawIngest', NewsRawIngestSchema);
