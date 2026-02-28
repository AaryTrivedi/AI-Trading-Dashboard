import { errorCodes, type ErrorCode } from './errorCodes.js';

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, details?: unknown): AppError {
    return new AppError(errorCodes.BAD_REQUEST, message, 400, details);
  }

  static unauthorized(message = 'Unauthorized'): AppError {
    return new AppError(errorCodes.UNAUTHORIZED, message, 401);
  }

  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(errorCodes.FORBIDDEN, message, 403);
  }

  static notFound(message = 'Resource not found'): AppError {
    return new AppError(errorCodes.NOT_FOUND, message, 404);
  }

  static conflict(message: string, details?: unknown): AppError {
    return new AppError(errorCodes.CONFLICT, message, 409, details);
  }

  static internal(message = 'Internal server error', details?: unknown): AppError {
    return new AppError(errorCodes.INTERNAL, message, 500, details);
  }
}
