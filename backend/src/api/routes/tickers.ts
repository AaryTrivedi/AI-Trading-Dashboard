import type { Router } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { validate } from '../middlewares/validate.http.js';
import * as tickerController from '../controllers/ticker.controller.js';
import { z } from 'zod';

const createTickerSchema = z.object({
  ticker: z.string().min(1).trim().transform((s) => s.toUpperCase()),
  name: z.string().trim().optional(),
  exchange: z.string().trim().optional(),
});

const updateTickerSchema = z.object({
  name: z.string().trim().optional(),
  exchange: z.string().trim().optional(),
});

const listQuerySchema = z.object({
  ticker: z.string().trim().optional().transform((s) => (s ? s.toUpperCase() : undefined)),
  exchange: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export function registerTickerRoutes(router: Router): void {
  router.get(
    '/tickers',
    validate(listQuerySchema, 'query'),
    asyncHandler(tickerController.listTickers)
  );

  router.get(
    '/tickers/:id',
    asyncHandler(tickerController.getTickerById)
  );

  router.post(
    '/tickers',
    validate(createTickerSchema),
    asyncHandler(tickerController.createTicker)
  );

  router.patch(
    '/tickers/:id',
    validate(updateTickerSchema),
    asyncHandler(tickerController.updateTicker)
  );

  router.delete(
    '/tickers/:id',
    asyncHandler(tickerController.deleteTicker)
  );
}
