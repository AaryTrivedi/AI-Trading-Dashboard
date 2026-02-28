import express from 'express';
import corsMiddleware from './config/cors.js';
import { requestId } from './common/middlewares/requestId.js';
import { errorHandler } from './common/middlewares/errorHandler.js';
import { registerRoutes } from './api/routes/index.js';

const app = express();

app.use(requestId);
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', (() => {
  const router = express.Router();
  registerRoutes(router);
  return router;
})());

app.use(errorHandler);

export default app;
