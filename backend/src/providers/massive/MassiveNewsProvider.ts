import {
  restClient,
  ListNewsOrderEnum,
  ListNewsSortEnum,
} from '@massive.com/client-js';
import type { NewsProvider } from '../NewsProvider.js';
import type { NewsItem } from '../types.js';
import type { FetchNewsParams } from '../NewsProvider.js';

export class MassiveNewsProvider implements NewsProvider {
  private readonly client: ReturnType<typeof restClient>;

  constructor(apiKey: string) {
    this.client = restClient(apiKey, 'https://api.massive.com');
  }

  async fetchNews(params: FetchNewsParams): Promise<NewsItem[]> {
    const ticker = params.tickers?.[0];
    const publishedUtcGte = params.from?.toISOString();
    const publishedUtcLte = params.to?.toISOString();
    const limit = params.limit ?? 10;

    const response = await this.client.listNews({
      ticker,
      publishedUtcGte,
      publishedUtcLte,
      order: ListNewsOrderEnum.Desc,
      limit: Math.min(limit, 1000),
      sort: ListNewsSortEnum.PublishedUtc,
    });

    const results = response.results ?? [];
    return results.map((r) => this.toNewsItem(r));
  }

  private toNewsItem(raw: {
    article_url: string;
    title: string;
    published_utc: string;
    publisher?: { name?: string };
    tickers?: string[];
  }): NewsItem {
    return {
      url: raw.article_url,
      title: raw.title,
      publishedAt: new Date(raw.published_utc),
      source: raw.publisher?.name,
      tickers: raw.tickers ?? [],
    };
  }
}
