import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from 'express-oauth2-jwt-bearer';
import { AppError } from '../errors/AppError.js';
import { logger } from '../../config/logger.js';

function isUnauthorizedError(err: unknown): err is UnauthorizedError {
  return err instanceof Error && 'statusCode' in err && (err as UnauthorizedError).statusCode === 401;
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details != null && typeof err.details === 'object' && { details: err.details }),
      },
    });
    return;
  }

  if (isUnauthorizedError(err)) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: err.message ?? 'Invalid or missing token',
      },
    });
    return;
  }

  logger.error({ err }, 'Unhandled error');
  res.status(500).json({
    error: { code: 'INTERNAL', message: 'Internal server error' },
  });
}
