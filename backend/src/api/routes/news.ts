import type { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { validate } from '../middlewares/validate.http.js';
import { IMPACT_CATEGORIES, IMPACT_TYPES } from '../../models/News.js';
import * as newsController from '../controllers/news.controller.js';

const impactCategoryEnum = z.enum(IMPACT_CATEGORIES as unknown as [string, ...string[]]);
const impactTypeEnum = z.enum(IMPACT_TYPES as unknown as [string, ...string[]]);

const createNewsSchema = z.object({
  url: z.string().url().trim(),
  title: z.string().min(1).trim(),
  publishedAt: z.coerce.date(),
  source: z.string().trim().optional(),
  tickers: z.array(z.string().trim()).default([]),
  aiSummary: z.string().default(''),
  impactCategory: impactCategoryEnum.default('none'),
  impactType: impactTypeEnum.default('mixed'),
});

const updateNewsSchema = z.object({
  url: z.string().url().trim().optional(),
  title: z.string().min(1).trim().optional(),
  publishedAt: z.coerce.date().optional(),
  source: z.string().trim().optional().nullable(),
  tickers: z.array(z.string().trim()).optional(),
  aiSummary: z.string().optional(),
  impactCategory: impactCategoryEnum.optional(),
  impactType: impactTypeEnum.optional(),
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
