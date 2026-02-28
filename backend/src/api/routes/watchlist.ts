import type { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { authHttp } from '../middlewares/auth.http.js';
import { ensureUserInDb } from '../middlewares/ensureUser.http.js';
import { validate } from '../middlewares/validate.http.js';
import * as watchlistController from '../controllers/watchlist.controller.js';

const createWatchlistSchema = z.object({
  ticker: z.string().min(1).trim().transform((s) => s.toUpperCase()),
});

const updateWatchlistSchema = z.object({
  ticker: z.string().min(1).trim().transform((s) => s.toUpperCase()),
});

const listQuerySchema = z.object({
  ticker: z.string().trim().optional().transform((s) => (s ? s.toUpperCase() : undefined)),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export function registerWatchlistRoutes(router: Router): void {
  const protected_ = [authHttp, ensureUserInDb];

  router.get(
    '/watchlists',
    protected_,
    validate(listQuerySchema, 'query'),
    asyncHandler(watchlistController.listWatchlist)
  );

  router.get(
    '/watchlists/dashboard',
    protected_,
    asyncHandler(watchlistController.listWatchlistForDashboard)
  );

  router.get(
    '/watchlists/:id',
    protected_,
    asyncHandler(watchlistController.getWatchlistById)
  );

  router.post(
    '/watchlists',
    protected_,
    validate(createWatchlistSchema),
    asyncHandler(watchlistController.createWatchlist)
  );

  router.patch(
    '/watchlists/:id',
    protected_,
    validate(updateWatchlistSchema),
    asyncHandler(watchlistController.updateWatchlist)
  );

  router.delete(
    '/watchlists/:id',
    protected_,
    asyncHandler(watchlistController.deleteWatchlist)
  );
}
