import type { Types } from 'mongoose';
import { News, type INews } from '../models/News.js';

export interface ListNewsFilter {
  tickers?: string[];
  publishedAfter?: Date;
  publishedBefore?: Date;
}

export interface ListNewsOptions {
  limit: number;
  offset: number;
}

export interface CreateNewsData {
  url_hash: string;
  url: string;
  canonical_url: string;
  headline: string;
  publishedAt: Date;
  source?: string;
  tickers: string[];
  impact: number;
  direction: INews['direction'];
  category: INews['category'];
  points: string[];
  confidence: number;
  model: string;
  prompt_version: string;
  createdAt: Date;
}

export type UpdateNewsData = Partial<Omit<CreateNewsData, 'createdAt'>> & { source?: string | null };

export interface ListNewsResult {
  items: INews[];
  total: number;
}

export class NewsRepository {
  async findMany(filter: ListNewsFilter, options: ListNewsOptions): Promise<ListNewsResult> {
    const mongoFilter: Record<string, unknown> = {};
    if (filter.tickers?.length) mongoFilter.tickers = { $in: filter.tickers };
    if (filter.publishedAfter ?? filter.publishedBefore) {
      mongoFilter.publishedAt = {};
      if (filter.publishedAfter)
        (mongoFilter.publishedAt as Record<string, Date>).$gte = filter.publishedAfter;
      if (filter.publishedBefore)
        (mongoFilter.publishedAt as Record<string, Date>).$lte = filter.publishedBefore;
    }
    const [items, total] = await Promise.all([
      News.find(mongoFilter)
        .sort({ publishedAt: -1 })
        .skip(options.offset)
        .limit(options.limit)
        .lean()
        .exec(),
      News.countDocuments(mongoFilter).exec(),
    ]);
    return { items: items as INews[], total };
  }

  async findById(id: Types.ObjectId | string): Promise<INews | null> {
    const doc = await News.findById(id).lean().exec();
    return doc as INews | null;
  }

  async create(data: CreateNewsData): Promise<INews> {
    const doc = await News.create(data);
    return doc.toObject();
  }

  async updateById(id: Types.ObjectId | string, data: UpdateNewsData): Promise<INews | null> {
    const update = { ...data };
    if (data.source === null) {
      (update as Record<string, unknown>).source = undefined;
    }
    const doc = await News.findByIdAndUpdate(id, { $set: update }, { new: true }).lean().exec();
    return doc as INews | null;
  }

  async deleteById(id: Types.ObjectId | string): Promise<boolean> {
    const result = await News.findByIdAndDelete(id).exec();
    return result != null;
  }
}

export const newsRepository = new NewsRepository();
