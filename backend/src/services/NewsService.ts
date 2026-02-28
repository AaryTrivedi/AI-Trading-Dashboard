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

export class NewsService {
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
      if (code === 11000) throw AppError.conflict('News with this URL already exists');
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
      if (code === 11000) throw AppError.conflict('News with this URL already exists');
      throw err;
    }
  }

  async delete(id: Types.ObjectId | string): Promise<void> {
    const deleted = await newsRepository.deleteById(id);
    if (!deleted) throw AppError.notFound('News not found');
  }
}

export const newsService = new NewsService();
