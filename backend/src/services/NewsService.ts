import type { Types } from 'mongoose';
import { AppError } from '../common/errors/AppError.js';
import {
  newsRepository,
  type ListNewsFilter,
  type ListNewsOptions,
  type CreateNewsData,
  type UpdateNewsData,
  type ListNewsResult,
} from '../repositories/NewsRepository.js';
import type { INews } from '../models/News.js';
import { newsProvider } from '../providers/index.js';
import type { NewsItem } from '../providers/types.js';
import { canonicalizeUrl, hashCanonicalUrl } from '../pipeline/utils/url.js';

/** API-facing news item (e.g. from provider) with _id and impact fields */
export interface ListNewsApiItem {
  _id: string;
  url_hash: string;
  url: string;
  canonical_url: string;
  headline: string;
  publishedAt: Date;
  source?: string;
  tickers: string[];
  impact: number;
  direction: string;
  category: string;
  points: string[];
  confidence: number;
  model: string;
  prompt_version: string;
}

function toListNewsApiItem(item: NewsItem): ListNewsApiItem {
  const canonicalUrl = canonicalizeUrl(item.url);
  const urlHash = hashCanonicalUrl(canonicalUrl);
  const _id = urlHash.slice(0, 24);
  return {
    _id,
    url_hash: urlHash,
    url: item.url,
    canonical_url: canonicalUrl,
    headline: item.title,
    publishedAt: item.publishedAt,
    source: item.source,
    tickers: item.tickers,
    impact: 5,
    direction: 'unclear',
    category: 'OTHER',
    points: [],
    confidence: 0,
    model: 'provider_fallback',
    prompt_version: 'none',
  };
}

export class NewsService {
  /**
   * Fetch live news from the configured provider (Massive).
   * Use when the client requests news by tickers.
   */
  async listFromProvider(tickers: string[], limit: number): Promise<{ items: ListNewsApiItem[] }> {
    const items = await newsProvider.fetchNews({ tickers, limit });
    return { items: items.map((item) => toListNewsApiItem(item)) };
  }

  async list(filter: ListNewsFilter, options: ListNewsOptions): Promise<ListNewsResult> {
    return newsRepository.findMany(filter, options);
  }

  async getById(id: Types.ObjectId | string): Promise<INews> {
    const doc = await newsRepository.findById(id);
    if (!doc) throw AppError.notFound('News not found');
    return doc;
  }

  async create(data: CreateNewsData): Promise<INews> {
    try {
      return await newsRepository.create(data);
    } catch (err: unknown) {
      const code = err && typeof err === 'object' && 'code' in err ? (err as { code: number }).code : null;
      if (code === 11000) throw AppError.conflict('News with this url_hash already exists');
      throw err;
    }
  }

  async update(id: Types.ObjectId | string, data: UpdateNewsData): Promise<INews> {
    try {
      const doc = await newsRepository.updateById(id, data);
      if (!doc) throw AppError.notFound('News not found');
      return doc;
    } catch (err: unknown) {
      if (err instanceof AppError) throw err;
      const code = err && typeof err === 'object' && 'code' in err ? (err as { code: number }).code : null;
      if (code === 11000) throw AppError.conflict('News with this url_hash already exists');
      throw err;
    }
  }

  async delete(id: Types.ObjectId | string): Promise<void> {
    const deleted = await newsRepository.deleteById(id);
    if (!deleted) throw AppError.notFound('News not found');
  }
}

export const newsService = new NewsService();
