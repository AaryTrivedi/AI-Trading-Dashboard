import type { Router } from 'express';
import { authHttp, type AuthenticatedRequest } from '../middlewares/auth.http.js';
import { registerNewsRoutes } from './news.js';
import { registerTickerRoutes } from './tickers.js';
import { registerWatchlistRoutes } from './watchlist.js';

/**
 * Mount all API route modules here.
 * Example: router.use('/health', healthRoutes);
 */
export function registerRoutes(router: Router): void {
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  /** Protected: requires Auth0 JWT; returns Auth0 sub (ensureUserInDb disabled for now) */
  router.get('/me', authHttp, (req, res) => {
    const { userId } = req as AuthenticatedRequest;
    res.json({
      userId: userId ?? undefined,
    });
  });

  registerNewsRoutes(router);
  registerTickerRoutes(router);
  registerWatchlistRoutes(router);
}
