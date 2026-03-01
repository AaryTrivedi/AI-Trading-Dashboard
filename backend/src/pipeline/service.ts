import { randomUUID } from 'node:crypto';
import pLimit from 'p-limit';
import { env } from '../config/env.js';
import { News } from '../models/News.js';
import { NewsImpactResult } from '../models/NewsImpactResult.js';
import { NewsRawIngest } from '../models/NewsRawIngest.js';
import { PipelineState } from '../models/PipelineState.js';
import { Watchlist } from '../models/Watchlist.js';
import { ImpactAiClassifier } from './ai.js';
import { PlaywrightArticleExtractor } from './extractor.js';
import { fetchNewsSince } from './newsFetcher.js';
import { pipelineLogger } from './logger.js';
import type { AiImpactResult, CanonicalNewsItem, ExtractedNewsItem, PipelineRunSummary } from './types.js';
import { canonicalizeUrl, hashCanonicalUrl } from './utils/url.js';

const LAST_INGEST_STATE_ID = 'last_ingest_at';

type PipelineStage = 'ingest' | 'extract' | 'ai' | 'store';
type PipelineStatus = 'ok' | 'skip' | 'fail';

function isTimeoutError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.message.toLowerCase().includes('timeout');
}

function logItemEvent(params: {
  runId: string;
  url?: string;
  urlHash?: string;
  stage: PipelineStage;
  status: PipelineStatus;
  durationMs: number;
  error?: string;
}): void {
  pipelineLogger.info({
    runId: params.runId,
    url: params.url,
    url_hash: params.urlHash,
    stage: params.stage,
    status: params.status,
    duration_ms: params.durationMs,
    error: params.error,
  });
}

async function upsertAiNewsRecord(item: ExtractedNewsItem, aiResult: AiImpactResult): Promise<void> {
  await News.updateOne(
    { url_hash: item.urlHash },
    {
      $set: {
        url_hash: item.urlHash,
        url: item.url,
        canonical_url: item.canonicalUrl,
        headline: item.headline,
        publishedAt: item.publishedAt,
        source: item.source,
        tickers: item.tickers ?? [],
        impact: aiResult.impact,
        direction: aiResult.direction,
        category: aiResult.category,
        points: aiResult.points,
        confidence: aiResult.confidence,
        model: env.PIPELINE_AI_MODEL,
        prompt_version: env.PIPELINE_PROMPT_VERSION,
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
}

async function getLastIngestAt(): Promise<Date> {
  const state = await PipelineState.findById(LAST_INGEST_STATE_ID).lean();
  if (state?.value != null) return new Date(state.value);

  const fallback = new Date(Date.now() - (env.PIPELINE_INITIAL_LOOKBACK_HOURS * 60 * 60 * 1000));
  return fallback;
}

async function setLastIngestAt(value: Date): Promise<void> {
  await PipelineState.updateOne(
    { _id: LAST_INGEST_STATE_ID },
    { $set: { value } },
    { upsert: true }
  );
}

async function upsertRawNews(items: CanonicalNewsItem[]): Promise<void> {
  if (items.length === 0) return;
  const fetchedAt = new Date();

  await NewsRawIngest.bulkWrite(
    items.map((item) => ({
      updateOne: {
        filter: { url_hash: item.urlHash },
        update: {
          $set: {
            url_hash: item.urlHash,
            url: item.url,
            canonical_url: item.canonicalUrl,
            headline: item.headline,
            source: item.source,
            published_at: item.publishedAt,
            tickers: item.tickers ?? [],
            fetched_at: fetchedAt,
          },
        },
        upsert: true,
      },
    })),
    { ordered: false }
  );
}

async function getWishlistedTickers(): Promise<string[]> {
  const rawTickers = await Watchlist.distinct('ticker', { ticker: { $exists: true, $ne: '' } });
  return Array.from(
    new Set(
      rawTickers
        .map((ticker) => (typeof ticker === 'string' ? ticker.trim().toUpperCase() : ''))
        .filter((ticker) => ticker.length > 0)
    )
  );
}

export async function runNewsImpactPipeline(): Promise<PipelineRunSummary> {
  const runId = randomUUID();
  const runStartedAt = new Date();
  const summary: PipelineRunSummary = {
    runId,
    ingested: 0,
    extracted_ok: 0,
    skipped_no_content: 0,
    ai_ok: 0,
    failed: 0,
    already_done: 0,
  };

  const wishlistedTickers = await getWishlistedTickers();
  if (wishlistedTickers.length === 0) {
    await setLastIngestAt(runStartedAt);
    pipelineLogger.info({
      runId,
      stage: 'ingest',
      status: 'skip',
      duration_ms: Date.now() - runStartedAt.getTime(),
      reason: 'no_wishlisted_tickers',
      summary,
    });
    return summary;
  }

  const since = await getLastIngestAt();
  const fetched = await fetchNewsSince(since, wishlistedTickers);
  summary.ingested = fetched.length;

  const canonicalItems: CanonicalNewsItem[] = [];
  for (const item of fetched) {
    const started = Date.now();
    try {
      const canonicalUrl = canonicalizeUrl(item.url);
      const urlHash = hashCanonicalUrl(canonicalUrl);
      canonicalItems.push({
        ...item,
        canonicalUrl,
        urlHash,
      });
      logItemEvent({
        runId,
        url: item.url,
        urlHash,
        stage: 'ingest',
        status: 'ok',
        durationMs: Date.now() - started,
      });
    } catch (error) {
      summary.failed += 1;
      logItemEvent({
        runId,
        url: item.url,
        stage: 'ingest',
        status: 'fail',
        durationMs: Date.now() - started,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  await upsertRawNews(canonicalItems);

  const uniqueCanonicalItems = Array.from(
    new Map(canonicalItems.map((item) => [item.urlHash, item])).values()
  );
  const existing = await NewsImpactResult.find(
    { url_hash: { $in: uniqueCanonicalItems.map((item) => item.urlHash) } },
    { url_hash: 1, _id: 0 }
  ).lean();
  const existingHashes = new Set(existing.map((item) => item.url_hash));

  const pendingItems = uniqueCanonicalItems.filter((item) => {
    if (!existingHashes.has(item.urlHash)) return true;
    summary.already_done += 1;
    logItemEvent({
      runId,
      url: item.url,
      urlHash: item.urlHash,
      stage: 'ingest',
      status: 'skip',
      durationMs: 0,
    });
    return false;
  });

  const extractor = new PlaywrightArticleExtractor(
    env.PIPELINE_EXTRACT_TIMEOUT_MS,
    env.PIPELINE_MIN_WORD_COUNT
  );
  const extractedItems: ExtractedNewsItem[] = [];
  const extractLimit = pLimit(env.PIPELINE_EXTRACT_CONCURRENCY);

  await Promise.all(
    pendingItems.map((item) => extractLimit(async () => {
      const started = Date.now();
      try {
        const extracted = await extractor.extract(item.url);
        if (extracted == null) {
          summary.skipped_no_content += 1;
          logItemEvent({
            runId,
            url: item.url,
            urlHash: item.urlHash,
            stage: 'extract',
            status: 'skip',
            durationMs: Date.now() - started,
          });
          return;
        }

        extractedItems.push({
          ...item,
          content: extracted.content,
        });
        summary.extracted_ok += 1;
        logItemEvent({
          runId,
          url: item.url,
          urlHash: item.urlHash,
          stage: 'extract',
          status: 'ok',
          durationMs: Date.now() - started,
        });
      } catch (error) {
        if (isTimeoutError(error)) {
          summary.skipped_no_content += 1;
          logItemEvent({
            runId,
            url: item.url,
            urlHash: item.urlHash,
            stage: 'extract',
            status: 'skip',
            durationMs: Date.now() - started,
            error: error instanceof Error ? error.message : String(error),
          });
          return;
        }

        summary.failed += 1;
        logItemEvent({
          runId,
          url: item.url,
          urlHash: item.urlHash,
          stage: 'extract',
          status: 'fail',
          durationMs: Date.now() - started,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }))
  );

  await extractor.close();

  const classifier = new ImpactAiClassifier();
  const aiLimit = pLimit(env.PIPELINE_AI_CONCURRENCY);
  await Promise.all(
    extractedItems.map((item) => aiLimit(async () => {
      const aiStarted = Date.now();
      try {
        const aiResult = await classifier.classify(item.headline, item.content);
        summary.ai_ok += 1;
        logItemEvent({
          runId,
          url: item.url,
          urlHash: item.urlHash,
          stage: 'ai',
          status: 'ok',
          durationMs: Date.now() - aiStarted,
        });

        const storeStarted = Date.now();
        const storeRes = await NewsImpactResult.updateOne(
          { url_hash: item.urlHash },
          {
            $setOnInsert: {
              url_hash: item.urlHash,
              url: item.url,
              canonical_url: item.canonicalUrl,
              headline: item.headline,
              impact: aiResult.impact,
              direction: aiResult.direction,
              category: aiResult.category,
              points: aiResult.points,
              confidence: aiResult.confidence,
              model: env.PIPELINE_AI_MODEL,
              prompt_version: env.PIPELINE_PROMPT_VERSION,
              created_at: new Date(),
            },
          },
          { upsert: true }
        );

        await upsertAiNewsRecord(item, aiResult);

        if (storeRes.upsertedCount === 0) {
          summary.already_done += 1;
          logItemEvent({
            runId,
            url: item.url,
            urlHash: item.urlHash,
            stage: 'store',
            status: 'skip',
            durationMs: Date.now() - storeStarted,
          });
          return;
        }

        logItemEvent({
          runId,
          url: item.url,
          urlHash: item.urlHash,
          stage: 'store',
          status: 'ok',
          durationMs: Date.now() - storeStarted,
        });
      } catch (error) {
        summary.failed += 1;
        logItemEvent({
          runId,
          url: item.url,
          urlHash: item.urlHash,
          stage: 'ai',
          status: 'fail',
          durationMs: Date.now() - aiStarted,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }))
  );

  await setLastIngestAt(runStartedAt);

  pipelineLogger.info({
    runId,
    stage: 'store',
    status: 'ok',
    duration_ms: Date.now() - runStartedAt.getTime(),
    summary,
  });

  return summary;
}
