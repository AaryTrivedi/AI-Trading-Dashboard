import type { PipelineRunSummary } from './types.js';
import { runNewsImpactPipeline } from './service.js';

export class PipelineAlreadyRunningError extends Error {
  constructor() {
    super('Pipeline run already in progress');
    this.name = 'PipelineAlreadyRunningError';
  }
}

let isRunning = false;

export function pipelineRunInProgress(): boolean {
  return isRunning;
}

export async function runPipelineWithLock(): Promise<PipelineRunSummary> {
  if (isRunning) {
    throw new PipelineAlreadyRunningError();
  }

  isRunning = true;
  try {
    return await runNewsImpactPipeline();
  } finally {
    isRunning = false;
  }
}
