import type { Router } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler.js';
import * as pipelineController from '../controllers/pipeline.controller.js';

export function registerPipelineRoutes(router: Router): void {
  router.post('/pipeline/run', asyncHandler(pipelineController.runPipeline));
}
