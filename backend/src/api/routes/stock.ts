import type { Router } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler.js';
import * as stockController from '../controllers/stock.controller.js';

export function registerStockRoutes(router: Router): void {
  router.get('/stocks/:ticker/overview', asyncHandler(stockController.getStockOverview));
}
