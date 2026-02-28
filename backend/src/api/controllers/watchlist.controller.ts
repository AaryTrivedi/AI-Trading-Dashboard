import type { Response } from 'express';
import { watchlistService } from '../../services/WatchlistService.js';
import type { ListWatchlistFilter, ListWatchlistOptions } from '../../repositories/WatchlistRepository.js';
import type { AuthenticatedRequest } from '../middlewares/auth.http.js';

export interface ListWatchlistQuery {
  ticker?: string;
  limit: number;
  offset: number;
}

export async function listWatchlist(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const dbUser = req.dbUser;
  if (!dbUser) {
    res.status(401).json({ error: 'User not found' });
    return;
  }

  const query = req.query as unknown as ListWatchlistQuery;
  const filter: ListWatchlistFilter = {
    userId: dbUser._id,
    ticker: query.ticker,
  };
  const options: ListWatchlistOptions = { limit: query.limit, offset: query.offset };
  const result = await watchlistService.list(filter, options);
  res.json({
    items: result.items,
    total: result.total,
    limit: options.limit,
    offset: options.offset,
  });
}

export async function getWatchlistById(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const dbUser = req.dbUser;
  if (!dbUser) {
    res.status(401).json({ error: 'User not found' });
    return;
  }

  const { id } = req.params;
  const doc = await watchlistService.getById(id, dbUser._id);
  res.json(doc);
}

export async function createWatchlist(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const dbUser = req.dbUser;
  if (!dbUser) {
    res.status(401).json({ error: 'User not found' });
    return;
  }

  const { ticker } = req.body as { ticker: string };
  const doc = await watchlistService.create({
    userId: dbUser._id,
    ticker,
    createdAt: new Date(),
  });
  res.status(201).json(doc);
}

export async function updateWatchlist(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const dbUser = req.dbUser;
  if (!dbUser) {
    res.status(401).json({ error: 'User not found' });
    return;
  }

  const { id } = req.params;
  const { ticker } = req.body as { ticker: string };
  const doc = await watchlistService.update(id, dbUser._id, ticker);
  res.json(doc);
}

export async function deleteWatchlist(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const dbUser = req.dbUser;
  if (!dbUser) {
    res.status(401).json({ error: 'User not found' });
    return;
  }

  const { id } = req.params;
  await watchlistService.delete(id, dbUser._id);
  res.status(204).send();
}
