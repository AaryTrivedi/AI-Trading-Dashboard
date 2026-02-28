import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../common/errors/AppError.js';

/** Placeholder: extend Request with user after JWT verification */
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

/**
 * JWT auth middleware for REST.
 * Verify Authorization: Bearer <token> and set req.userId.
 * TODO: integrate jsonwebtoken or jose, validate against env.JWT_SECRET.
 */
export function authHttp(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    next(AppError.unauthorized('Missing or invalid Authorization header'));
    return;
  }
  const token = auth.slice(7);
  // TODO: verify JWT and set req.userId
  if (!token) {
    next(AppError.unauthorized('Invalid token'));
    return;
  }
  (req as AuthenticatedRequest).userId = 'placeholder-user-id';
  next();
}

/** Optional auth: set userId if valid token present, otherwise continue without it */
export function optionalAuthHttp(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    const token = auth.slice(7);
    if (token) (req as AuthenticatedRequest).userId = 'placeholder-user-id';
  }
  next();
}
