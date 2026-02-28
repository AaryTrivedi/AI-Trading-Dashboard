import type { Request, Response } from 'express';
import { tickerService } from '../../services/TickerService.js';
import type { ListTickerFilter, ListTickerOptions } from '../../repositories/TickerRepository.js';
import type { UpdateTickerData } from '../../repositories/TickerRepository.js';

export interface ListTickerQuery {
  ticker?: string;
  exchange?: string;
  limit: number;
  offset: number;
}

export async function listTickers(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as ListTickerQuery;
  const filter: ListTickerFilter = {
    ticker: query.ticker,
    exchange: query.exchange,
  };
  const options: ListTickerOptions = { limit: query.limit, offset: query.offset };
  const result = await tickerService.list(filter, options);
  res.json({
    items: result.items,
    total: result.total,
    limit: options.limit,
    offset: options.offset,
  });
}

export async function getTickerById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const doc = await tickerService.getById(id);
  res.json(doc);
}

export async function createTicker(req: Request, res: Response): Promise<void> {
  const body = req.body as { ticker: string; name?: string; exchange?: string };
  const doc = await tickerService.create({
    ticker: body.ticker,
    name: body.name,
    exchange: body.exchange,
    createdAt: new Date(),
  });
  res.status(201).json(doc);
}

export async function updateTicker(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const body = req.body as UpdateTickerData;
  const doc = await tickerService.update(id, body);
  res.json(doc);
}

export async function deleteTicker(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  await tickerService.delete(id);
  res.status(204).send();
}
