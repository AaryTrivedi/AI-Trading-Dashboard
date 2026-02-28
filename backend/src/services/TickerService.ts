import type { Types } from 'mongoose';
import { AppError } from '../common/errors/AppError.js';
import {
  tickerRepository,
  type ListTickerFilter,
  type ListTickerOptions,
  type CreateTickerData,
  type UpdateTickerData,
  type ListTickerResult,
} from '../repositories/TickerRepository.js';
import type { ITicker } from '../models/Ticker.js';

export class TickerService {
  async list(filter: ListTickerFilter, options: ListTickerOptions): Promise<ListTickerResult> {
    return tickerRepository.findMany(filter, options);
  }

  async getById(id: Types.ObjectId | string): Promise<ITicker> {
    const doc = await tickerRepository.findById(id);
    if (!doc) throw AppError.notFound('Ticker not found');
    return doc;
  }

  async getByTicker(ticker: string): Promise<ITicker> {
    const doc = await tickerRepository.findByTicker(ticker);
    if (!doc) throw AppError.notFound('Ticker not found');
    return doc;
  }

  async create(data: CreateTickerData): Promise<ITicker> {
    const ticker = (data.ticker || '').trim().toUpperCase();
    if (!ticker) throw AppError.badRequest('ticker is required');

    const existing = await tickerRepository.findByTicker(ticker);
    if (existing) throw AppError.conflict('Ticker already exists');

    try {
      return await tickerRepository.create({
        ticker,
        name: data.name,
        exchange: data.exchange,
        createdAt: new Date(),
      });
    } catch (err: unknown) {
      const code = err && typeof err === 'object' && 'code' in err ? (err as { code: number }).code : null;
      if (code === 11000) throw AppError.conflict('Ticker already exists');
      throw err;
    }
  }

  async update(id: Types.ObjectId | string, data: UpdateTickerData): Promise<ITicker> {
    const doc = await tickerRepository.findById(id);
    if (!doc) throw AppError.notFound('Ticker not found');

    const updated = await tickerRepository.updateById(id, data);
    if (!updated) throw AppError.notFound('Ticker not found');
    return updated;
  }

  async delete(id: Types.ObjectId | string): Promise<void> {
    const doc = await tickerRepository.findById(id);
    if (!doc) throw AppError.notFound('Ticker not found');

    const deleted = await tickerRepository.deleteById(id);
    if (!deleted) throw AppError.notFound('Ticker not found');
  }
}

export const tickerService = new TickerService();
