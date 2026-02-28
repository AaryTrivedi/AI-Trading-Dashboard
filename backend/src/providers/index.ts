import { env } from '../config/env.js';
import type { NewsProvider } from './NewsProvider.js';
import type { StockDataProvider } from './StockDataProvider.js';
import { MassiveNewsProvider } from './massive/MassiveNewsProvider.js';
import { MassiveStockProvider } from './massive/MassiveStockProvider.js';

function createNewsProvider(): NewsProvider {
  const provider = env.NEWS_PROVIDER;
  if (provider === 'massive') {
    const apiKey = env.MASSIVE_API_KEY;
    if (!apiKey) {
      throw new Error('MASSIVE_API_KEY is required when NEWS_PROVIDER is "massive"');
    }
    return new MassiveNewsProvider(apiKey);
  }
  throw new Error(`Unknown NEWS_PROVIDER: ${provider}`);
}

function createStockDataProvider(): StockDataProvider {
  const provider = env.STOCK_DATA_PROVIDER;
  if (provider === 'massive') {
    const apiKey = env.MASSIVE_API_KEY;
    if (!apiKey) {
      throw new Error('MASSIVE_API_KEY is required when STOCK_DATA_PROVIDER is "massive"');
    }
    return new MassiveStockProvider(apiKey);
  }
  throw new Error(`Unknown STOCK_DATA_PROVIDER: ${provider}`);
}

export const newsProvider = createNewsProvider();
export const stockDataProvider = createStockDataProvider();

export type { NewsProvider, FetchNewsParams } from './NewsProvider.js';
export type { StockDataProvider } from './StockDataProvider.js';
export type { NewsItem, StockDetails, StockQuote, StockBar } from './types.js';
