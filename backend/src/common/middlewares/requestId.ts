import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from '../utils/uuid.js';

const HEADER = 'x-request-id';

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = (req.headers[HEADER] as string) || uuidv4();
  req.headers[HEADER] = id;
  res.setHeader(HEADER, id);
  next();
}
