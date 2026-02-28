import type { Types } from 'mongoose';
import { Watchlist, type IWatchlist } from '../models/Watchlist.js';

export interface ListWatchlistFilter {
  userId: Types.ObjectId;
  ticker?: string;
}

export interface ListWatchlistOptions {
  limit: number;
  offset: number;
}

export interface CreateWatchlistData {
  userId: Types.ObjectId;
  ticker: string;
  createdAt?: Date;
}

export interface ListWatchlistResult {
  items: IWatchlist[];
  total: number;
}

export class WatchlistRepository {
  async findMany(filter: ListWatchlistFilter, options: ListWatchlistOptions): Promise<ListWatchlistResult> {
    const mongoFilter: Record<string, unknown> = { userId: filter.userId };
    if (filter.ticker) mongoFilter.ticker = filter.ticker;

    const [items, total] = await Promise.all([
      Watchlist.find(mongoFilter)
        .sort({ createdAt: -1 })
        .skip(options.offset)
        .limit(options.limit)
        .lean()
        .exec(),
      Watchlist.countDocuments(mongoFilter).exec(),
    ]);
    return { items: items as IWatchlist[], total };
  }

  async findById(id: Types.ObjectId | string): Promise<IWatchlist | null> {
    const doc = await Watchlist.findById(id).lean().exec();
    return doc as IWatchlist | null;
  }

  async findByUserAndTicker(userId: Types.ObjectId, ticker: string): Promise<IWatchlist | null> {
    const doc = await Watchlist.findOne({ userId, ticker: ticker.toUpperCase() }).lean().exec();
    return doc as IWatchlist | null;
  }

  async create(data: CreateWatchlistData): Promise<IWatchlist> {
    const ticker = (data.ticker || '').trim().toUpperCase();
    const doc = await Watchlist.create({
      ...data,
      ticker,
      createdAt: data.createdAt ?? new Date(),
    });
    return doc.toObject();
  }

  async updateById(id: Types.ObjectId | string, ticker: string): Promise<IWatchlist | null> {
    const doc = await Watchlist.findByIdAndUpdate(
      id,
      { $set: { ticker: ticker.trim().toUpperCase() } },
      { new: true }
    )
      .lean()
      .exec();
    return doc as IWatchlist | null;
  }

  async deleteById(id: Types.ObjectId | string): Promise<boolean> {
    const result = await Watchlist.findByIdAndDelete(id).exec();
    return result != null;
  }
}

export const watchlistRepository = new WatchlistRepository();
