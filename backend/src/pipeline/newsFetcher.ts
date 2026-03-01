import { env } from '../config/env.js';
import { newsProvider } from '../providers/index.js';
import { retryWithBackoff } from './utils/retry.js';
import type { FetchedNewsItem } from './types.js';

export async function fetchNewsSince(since: Date, tickers: string[]): Promise<FetchedNewsItem[]> {
  if (tickers.length === 0) return [];

  const to = new Date();
  const batches = await Promise.all(
    tickers.map((ticker) => retryWithBackoff(
      async () => newsProvider.fetchNews({ tickers: [ticker], from: since, to }),
      {
        attempts: env.PIPELINE_RETRY_ATTEMPTS,
        baseDelayMs: env.PIPELINE_RETRY_BASE_DELAY_MS,
        maxDelayMs: env.PIPELINE_RETRY_MAX_DELAY_MS,
      }
    ))
  );

  const items = batches.flat();

  return items.map((item) => ({
    url: item.url,
    headline: item.title,
    source: item.source,
    publishedAt: item.publishedAt,
    tickers: item.tickers,
  }));
}
