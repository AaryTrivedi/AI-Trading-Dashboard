import type { Request, Response, NextFunction } from 'express';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;

/**
 * Wraps async route handlers so Express catches rejected promises.
 */
export function asyncHandler(fn: AsyncRequestHandler): AsyncRequestHandler {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
