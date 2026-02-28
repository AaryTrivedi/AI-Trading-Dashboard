import type { Request, Response, NextFunction } from 'express';
import { auth0Jwt } from '../../config/auth0.js';

/** Request with userId set after Auth0 JWT validation (auth is set by express-oauth2-jwt-bearer on Request) */
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

/**
 * JWT auth middleware for REST: validates Auth0 access token and sets req.userId from payload.sub.
 * Use on routes that require authentication.
 */
export function authHttp(req: Request, res: Response, next: NextFunction): void {
  auth0Jwt(req, res, (err?: unknown) => {
    if (err) return next(err);
    const sub = req.auth?.payload?.sub;
    if (sub) (req as AuthenticatedRequest).userId = sub;
    next();
  });
}

/**
 * Optional auth: validates token if present and sets req.userId; does not require a token.
 * If no Authorization header, continues without userId. If token is invalid, still returns 401.
 */
export function optionalAuthHttp(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return next();
  auth0Jwt(req, res, (err?: unknown) => {
    if (err) return next(err);
    const sub = req.auth?.payload?.sub;
    if (sub) (req as AuthenticatedRequest).userId = sub;
    next();
  });
}
