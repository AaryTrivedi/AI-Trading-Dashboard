import express from 'express';
import corsMiddleware from './config/cors.js';
import { requestId } from './common/middlewares/requestId.js';
import { errorHandler } from './common/middlewares/errorHandler.js';
import { asyncHandler } from './common/utils/asyncHandler.js';
import { registerRoutes } from './api/routes/index.js';
import * as pipelineController from './api/controllers/pipeline.controller.js';

const app = express();

app.use(requestId);
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Keep lightweight non-/api aliases for operational checks and manual runs.
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.post('/pipeline/run', asyncHandler(pipelineController.runPipeline));

app.use('/api', (() => {
  const router = express.Router();
  registerRoutes(router);
  return router;
})());

app.use(errorHandler);

export default app;
