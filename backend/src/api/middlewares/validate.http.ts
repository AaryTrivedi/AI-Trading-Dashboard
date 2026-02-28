import type { Request, Response, NextFunction } from 'express';
import type { z } from 'zod';
import { AppError } from '../../common/errors/AppError.js';
import { errorCodes } from '../../common/errors/errorCodes.js';

type SchemaSource = 'body' | 'query' | 'params' | 'headers';

/**
 * Validation middleware factory using Zod.
 * validate(schema) validates req.body; validate(schema, 'query') validates req.query, etc.
 */
export function validate<T extends z.ZodType>(
  schema: T,
  source: SchemaSource = 'body'
): (req: Request, _res: Response, next: NextFunction) => void {
  return (req: Request, _res: Response, next: NextFunction) => {
    const value = req[source];
    const result = schema.safeParse(value);
    if (result.success) {
      (req as Request & Record<string, unknown>)[source] = result.data;
      next();
      return;
    }
    const message = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    next(new AppError(errorCodes.VALIDATION, message, 400, result.error.flatten()));
  };
}
