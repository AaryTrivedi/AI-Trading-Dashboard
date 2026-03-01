import type { Router } from 'express';
import { authHttp, type AuthenticatedRequest } from '../middlewares/auth.http.js';
import { ensureUserInDb } from '../middlewares/ensureUser.http.js';
import { registerNewsRoutes } from './news.js';
import { registerStockRoutes } from './stock.js';
import { registerTickerRoutes } from './tickers.js';
import { registerWatchlistRoutes } from './watchlist.js';
import { registerPipelineRoutes } from './pipeline.js';

/**
 * Mount all API route modules here.
 * Example: router.use('/health', healthRoutes);
 */
export function registerRoutes(router: Router): void {
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  /** Protected: requires Auth0 JWT + user in DB */
  router.get('/me', authHttp, ensureUserInDb, (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const dbUser = authReq.dbUser;
    res.json({
      userId: authReq.userId ?? undefined,
      ...(dbUser && {
        dbUser: {
          id: dbUser._id.toString(),
          email: dbUser.email,
          name: dbUser.name,
          picture: dbUser.picture,
        },
      }),
    });
  });

  registerNewsRoutes(router);
  registerPipelineRoutes(router);
  registerStockRoutes(router);
  registerTickerRoutes(router);
  registerWatchlistRoutes(router);
}
