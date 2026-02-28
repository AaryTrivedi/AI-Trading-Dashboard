import type { Types } from 'mongoose';
import { Ticker, type ITicker } from '../models/Ticker.js';

export interface ListTickerFilter {
  ticker?: string;
  exchange?: string;
}

export interface ListTickerOptions {
  limit: number;
  offset: number;
}

export interface CreateTickerData {
  ticker: string;
  name?: string;
  exchange?: string;
  createdAt?: Date;
}

export interface UpdateTickerData {
  name?: string;
  exchange?: string;
}

export interface ListTickerResult {
  items: ITicker[];
  total: number;
}

export class TickerRepository {
  async findMany(filter: ListTickerFilter, options: ListTickerOptions): Promise<ListTickerResult> {
    const mongoFilter: Record<string, unknown> = {};
    if (filter.ticker) mongoFilter.ticker = filter.ticker;
    if (filter.exchange) mongoFilter.exchange = filter.exchange;

    const [items, total] = await Promise.all([
      Ticker.find(mongoFilter)
        .sort({ ticker: 1 })
        .skip(options.offset)
        .limit(options.limit)
        .lean()
        .exec(),
      Ticker.countDocuments(mongoFilter).exec(),
    ]);
    return { items: items as ITicker[], total };
  }

  async findById(id: Types.ObjectId | string): Promise<ITicker | null> {
    const doc = await Ticker.findById(id).lean().exec();
    return doc as ITicker | null;
  }

  async findByTicker(ticker: string): Promise<ITicker | null> {
    const doc = await Ticker.findOne({ ticker: ticker.toUpperCase().trim() }).lean().exec();
    return doc as ITicker | null;
  }

  async create(data: CreateTickerData): Promise<ITicker> {
    const ticker = (data.ticker || '').trim().toUpperCase();
    const doc = await Ticker.create({
      ticker,
      name: data.name,
      exchange: data.exchange,
      createdAt: data.createdAt ?? new Date(),
    });
    return doc.toObject();
  }

  async updateById(id: Types.ObjectId | string, data: UpdateTickerData): Promise<ITicker | null> {
    const update: Record<string, unknown> = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.exchange !== undefined) update.exchange = data.exchange;
    if (Object.keys(update).length === 0) return this.findById(id);

    const doc = await Ticker.findByIdAndUpdate(id, { $set: update }, { new: true })
      .lean()
      .exec();
    return doc as ITicker | null;
  }

  async deleteById(id: Types.ObjectId | string): Promise<boolean> {
    const result = await Ticker.findByIdAndDelete(id).exec();
    return result != null;
  }
}

export const tickerRepository = new TickerRepository();
