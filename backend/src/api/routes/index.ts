import type { Router } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { authHttp, type AuthenticatedRequest } from '../middlewares/auth.http.js';
import { ensureUserInDb } from '../middlewares/ensureUser.http.js';
import { registerNewsRoutes } from './news.js';
import { registerWatchlistRoutes } from './watchlist.js';

/**
 * Mount all API route modules here.
 * Example: router.use('/health', healthRoutes);
 */
export function registerRoutes(router: Router): void {
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  /** Protected: requires Auth0 JWT; ensures user exists in DB; returns Auth0 sub and DB user id */
  router.get('/me', authHttp, asyncHandler(ensureUserInDb), (req, res) => {
    const { userId, dbUser } = req as AuthenticatedRequest;
    res.json({
      userId: userId ?? undefined,
      dbUserId: dbUser?._id?.toString(),
      email: dbUser?.email,
    });
  });

  registerNewsRoutes(router);
  registerWatchlistRoutes(router);
}
