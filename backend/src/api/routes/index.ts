import type { Router } from 'express';
import { authHttp, type AuthenticatedRequest } from '../middlewares/auth.http.js';

/**
 * Mount all API route modules here.
 * Example: router.use('/health', healthRoutes);
 */
export function registerRoutes(router: Router): void {
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  /** Protected example: requires Auth0 JWT; returns current user id from token */
  router.get('/me', authHttp, (req, res) => {
    const userId = (req as AuthenticatedRequest).userId;
    res.json({ userId });
  });

  // router.use('/auth', authRoutes);
  // router.use('/watchlist', watchlistRoutes);
  // router.use('/news', newsRoutes);
}
