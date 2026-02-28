import type { NewsItem } from './types.js';

export interface FetchNewsParams {
  tickers?: string[];
  from?: Date;
  to?: Date;
  limit?: number;
}

export interface NewsProvider {
  fetchNews(params: FetchNewsParams): Promise<NewsItem[]>;
}
