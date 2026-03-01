import { mkdirSync } from 'node:fs';
import path from 'node:path';
import pino from 'pino';

const logDir = path.resolve(process.cwd(), 'logs');
mkdirSync(logDir, { recursive: true });

const destination = pino.destination({
  dest: path.join(logDir, 'pipeline.log'),
  sync: false,
});

const streams = pino.multistream([
  { stream: process.stdout },
  { stream: destination },
]);

export const pipelineLogger = pino(
  {
    level: 'info',
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  streams
);
