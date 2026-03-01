import cron, { type ScheduledTask } from 'node-cron';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { PipelineAlreadyRunningError, runPipelineWithLock } from './runner.js';

let schedulerTask: ScheduledTask | null = null;

export function startPipelineScheduler(): void {
  if (!env.PIPELINE_CRON_ENABLED) {
    logger.info('Pipeline cron scheduling disabled by config');
    return;
  }

  schedulerTask = cron.schedule(env.PIPELINE_CRON_SCHEDULE, async () => {
    try {
      const summary = await runPipelineWithLock();
      logger.info({ summary }, 'Pipeline cron run completed');
    } catch (error) {
      if (error instanceof PipelineAlreadyRunningError) {
        logger.info('Skipping scheduled run because pipeline is already running');
        return;
      }
      logger.error({ err: error }, 'Pipeline cron run failed');
    }
  });

  logger.info({ schedule: env.PIPELINE_CRON_SCHEDULE }, 'Pipeline scheduler started');
}

export function stopPipelineScheduler(): void {
  if (schedulerTask != null) {
    schedulerTask.stop();
    schedulerTask = null;
    logger.info('Pipeline scheduler stopped');
  }
}
