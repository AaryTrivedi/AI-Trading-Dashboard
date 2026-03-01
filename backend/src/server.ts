import { createServer } from 'node:http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectMongo } from './config/mongo.js';
import app from './app.js';
import { startPipelineScheduler } from './pipeline/scheduler.js';

const server = createServer(app);

async function start(): Promise<void> {
  await connectMongo();
  startPipelineScheduler();
  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'Server listening');
  });
}

start().catch((err) => {
  logger.fatal({ err }, 'Failed to start server');
  process.exit(1);
});

export default server;
