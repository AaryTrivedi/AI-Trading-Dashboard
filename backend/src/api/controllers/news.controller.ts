import type { Request, Response } from 'express';
import { newsService } from '../../services/NewsService.js';
import type { CreateNewsData, UpdateNewsData } from '../../repositories/NewsRepository.js';
import type { ListNewsFilter, ListNewsOptions } from '../../repositories/NewsRepository.js';

export interface ListNewsQuery {
  tickers?: string[];
  publishedAfter?: Date;
  publishedBefore?: Date;
  limit: number;
  offset: number;
}

export interface CreateNewsBody extends Omit<CreateNewsData, 'createdAt'> {}

export interface UpdateNewsBody extends UpdateNewsData {}

export async function listNews(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as ListNewsQuery;
  const filter: ListNewsFilter = {
    tickers: query.tickers,
    publishedAfter: query.publishedAfter,
    publishedBefore: query.publishedBefore,
  };
  const options: ListNewsOptions = { limit: query.limit, offset: query.offset };
  const result = await newsService.list(filter, options);
  res.json({
    items: result.items,
    total: result.total,
    limit: options.limit,
    offset: options.offset,
  });
}

export async function getNewsById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const doc = await newsService.getById(id);
  res.json(doc);
}

export async function createNews(req: Request, res: Response): Promise<void> {
  const body = req.body as CreateNewsBody;
  const doc = await newsService.create({
    ...body,
    createdAt: new Date(),
  });
  res.status(201).json(doc);
}

export async function updateNews(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const body = req.body as UpdateNewsBody;
  const doc = await newsService.update(id, body);
  res.json(doc);
}

export async function deleteNews(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  await newsService.delete(id);
  res.status(204).send();
}
