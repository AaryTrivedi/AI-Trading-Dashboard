import { connectMongo, disconnectMongo } from '../config/mongo.js';
import { logger } from '../config/logger.js';
import { runPipelineWithLock } from './runner.js';

async function main(): Promise<void> {
  await connectMongo();
  try {
    const summary = await runPipelineWithLock();
    logger.info({ summary }, 'Pipeline run completed');
  } finally {
    await disconnectMongo();
  }
}

main().catch((error) => {
  logger.error({ err: error }, 'Pipeline run failed');
  process.exit(1);
});
