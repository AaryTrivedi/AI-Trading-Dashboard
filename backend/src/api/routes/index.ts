import type { Router } from 'express';

/**
 * Mount all API route modules here.
 * Example: router.use('/health', healthRoutes);
 */
export function registerRoutes(router: Router): void {
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  // router.use('/auth', authRoutes);
  // router.use('/watchlist', watchlistRoutes);
  // router.use('/news', newsRoutes);
}
