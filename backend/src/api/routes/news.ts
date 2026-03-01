import type { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { validate } from '../middlewares/validate.http.js';
import { IMPACT_CATEGORIES, IMPACT_DIRECTIONS } from '../../models/News.js';
import * as newsController from '../controllers/news.controller.js';

const impactCategoryEnum = z.enum(IMPACT_CATEGORIES as unknown as [string, ...string[]]);
const impactDirectionEnum = z.enum(IMPACT_DIRECTIONS as unknown as [string, ...string[]]);

const createNewsSchema = z.object({
  url_hash: z.string().length(64).trim(),
  url: z.string().url().trim(),
  canonical_url: z.string().url().trim(),
  headline: z.string().min(1).trim(),
  publishedAt: z.coerce.date(),
  source: z.string().trim().optional(),
  tickers: z.array(z.string().trim()).default([]),
  impact: z.number().int().min(1).max(10),
  direction: impactDirectionEnum,
  category: impactCategoryEnum,
  points: z.array(z.string().min(1)).min(3).max(6),
  confidence: z.number().min(0).max(1),
  model: z.string().min(1).trim(),
  prompt_version: z.string().min(1).trim(),
});

const updateNewsSchema = z.object({
  url_hash: z.string().length(64).trim().optional(),
  url: z.string().url().trim().optional(),
  canonical_url: z.string().url().trim().optional(),
  headline: z.string().min(1).trim().optional(),
  publishedAt: z.coerce.date().optional(),
  source: z.string().trim().optional().nullable(),
  tickers: z.array(z.string().trim()).optional(),
  impact: z.number().int().min(1).max(10).optional(),
  direction: impactDirectionEnum.optional(),
  category: impactCategoryEnum.optional(),
  points: z.array(z.string().min(1)).min(3).max(6).optional(),
  confidence: z.number().min(0).max(1).optional(),
  model: z.string().min(1).trim().optional(),
  prompt_version: z.string().min(1).trim().optional(),
});

const listQuerySchema = z.object({
  tickers: z
    .string()
    .optional()
    .transform((s) => (s ? s.split(',').map((t) => t.trim()).filter(Boolean) : undefined)),
  publishedAfter: z.coerce.date().optional(),
  publishedBefore: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export function registerNewsRoutes(router: Router): void {
  router.get(
    '/news',
    validate(listQuerySchema, 'query'),
    asyncHandler(newsController.listNews)
  );

  router.get(
    '/news/:id',
    asyncHandler(newsController.getNewsById)
  );

  router.post(
    '/news',
    validate(createNewsSchema),
    asyncHandler(newsController.createNews)
  );

  router.patch(
    '/news/:id',
    validate(updateNewsSchema),
    asyncHandler(newsController.updateNews)
  );

  router.delete(
    '/news/:id',
    asyncHandler(newsController.deleteNews)
  );
}
