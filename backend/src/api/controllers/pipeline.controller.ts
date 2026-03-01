import type { Request, Response } from 'express';
import { runPipelineWithLock, PipelineAlreadyRunningError } from '../../pipeline/runner.js';

export async function runPipeline(_req: Request, res: Response): Promise<void> {
  try {
    const summary = await runPipelineWithLock();
    res.status(200).json(summary);
  } catch (error) {
    if (error instanceof PipelineAlreadyRunningError) {
      res.status(409).json({
        error: {
          code: 'PIPELINE_RUNNING',
          message: 'A pipeline run is already in progress',
        },
      });
      return;
    }
    throw error;
  }
}
