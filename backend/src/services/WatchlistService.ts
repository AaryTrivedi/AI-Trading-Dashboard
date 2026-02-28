import type { Types } from 'mongoose';
import { AppError } from '../common/errors/AppError.js';
import {
  watchlistRepository,
  type ListWatchlistFilter,
  type ListWatchlistOptions,
  type CreateWatchlistData,
  type ListWatchlistResult,
} from '../repositories/WatchlistRepository.js';
import type { IWatchlist } from '../models/Watchlist.js';

export class WatchlistService {
  async list(filter: ListWatchlistFilter, options: ListWatchlistOptions): Promise<ListWatchlistResult> {
    return watchlistRepository.findMany(filter, options);
  }

  async getById(id: Types.ObjectId | string, userId: Types.ObjectId): Promise<IWatchlist> {
    const doc = await watchlistRepository.findById(id);
    if (!doc) throw AppError.notFound('Watchlist item not found');
    if (!doc.userId.equals(userId)) throw AppError.forbidden('Not allowed to access this watchlist item');
    return doc;
  }

  async create(data: CreateWatchlistData): Promise<IWatchlist> {
    const ticker = (data.ticker || '').trim().toUpperCase();
    if (!ticker) throw AppError.badRequest('ticker is required');

    const existing = await watchlistRepository.findByUserAndTicker(data.userId, ticker);
    if (existing) throw AppError.conflict('Ticker already in watchlist');

    try {
      return await watchlistRepository.create({
        userId: data.userId,
        ticker,
        createdAt: new Date(),
      });
    } catch (err: unknown) {
      const code = err && typeof err === 'object' && 'code' in err ? (err as { code: number }).code : null;
      if (code === 11000) throw AppError.conflict('Ticker already in watchlist');
      throw err;
    }
  }

  async update(id: Types.ObjectId | string, userId: Types.ObjectId, ticker: string): Promise<IWatchlist> {
    const doc = await watchlistRepository.findById(id);
    if (!doc) throw AppError.notFound('Watchlist item not found');
    if (!doc.userId.equals(userId)) throw AppError.forbidden('Not allowed to update this watchlist item');

    const newTicker = ticker.trim().toUpperCase();
    if (!newTicker) throw AppError.badRequest('ticker is required');

    const existing = await watchlistRepository.findByUserAndTicker(userId, newTicker);
    if (existing && !existing._id.equals(id)) throw AppError.conflict('Ticker already in watchlist');

    const updated = await watchlistRepository.updateById(id, newTicker);
    if (!updated) throw AppError.notFound('Watchlist item not found');
    return updated;
  }

  async delete(id: Types.ObjectId | string, userId: Types.ObjectId): Promise<void> {
    const doc = await watchlistRepository.findById(id);
    if (!doc) throw AppError.notFound('Watchlist item not found');
    if (!doc.userId.equals(userId)) throw AppError.forbidden('Not allowed to delete this watchlist item');

    const deleted = await watchlistRepository.deleteById(id);
    if (!deleted) throw AppError.notFound('Watchlist item not found');
  }
}

export const watchlistService = new WatchlistService();
