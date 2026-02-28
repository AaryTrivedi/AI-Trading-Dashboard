import {
  restClient,
  GetStocksAggregatesTimespanEnum,
  GetStocksAggregatesSortEnum,
} from '@massive.com/client-js';
import type { StockDataProvider } from '../StockDataProvider.js';
import type { StockDetails, StockQuote, StockBar } from '../types.js';

export class MassiveStockProvider implements StockDataProvider {
  private readonly client: ReturnType<typeof restClient>;

  constructor(apiKey: string) {
    this.client = restClient(apiKey, 'https://api.massive.com');
  }

  async listTickers(search?: string): Promise<StockDetails[]> {
    try {
      const response = await this.client.listTickers({
        search: search?.toUpperCase(),
      });
      return response?.results?.map((r) => this.toStockDetails(r)) ?? [];
    } catch {
      return [];
    }
  }

  async getTickerDetails(ticker: string): Promise<StockDetails | null> {
    try {
      const response = await this.client.getTicker({
        ticker: ticker.toUpperCase(),
      });
      const results = response.results;
      if (!results) return null;
      return this.toStockDetails(results);
    } catch {
      return null;
    }
  }

  async getLastTrade(ticker: string): Promise<StockQuote | null> {
    try {
      const response = await this.client.getLastStocksTrade({
        stocksTicker: ticker.toUpperCase(),
      });
      const results = response.results;
      if (!results) return null;
      return this.toStockQuoteFromTrade(ticker.toUpperCase(), results);
    } catch {
      return null;
    }
  }

  async getLastQuote(ticker: string): Promise<StockQuote | null> {
    try {
      const response = await this.client.getLastStocksQuote({
        stocksTicker: ticker.toUpperCase(),
      });
      const results = response.results;
      if (!results) return null;
      return this.toStockQuoteFromQuote(ticker.toUpperCase(), results);
    } catch {
      return null;
    }
  }

  async getAggregates(
    ticker: string,
    from: Date,
    to: Date,
    timespan: string = 'day'
  ): Promise<StockBar[]> {
    try {
      const response = await this.client.getStocksAggregates({
        stocksTicker: ticker.toUpperCase(),
        multiplier: 1,
        timespan: this.toTimespanEnum(timespan),
        from: this.formatDate(from),
        to: this.formatDate(to),
        adjusted: true,
        sort: GetStocksAggregatesSortEnum.Asc,
        limit: 5000,
      });
      const results = response.results ?? [];
      return results.map((r) => this.toStockBar(ticker.toUpperCase(), r));
    } catch {
      return [];
    }
  }

  private toStockDetails(raw: {
    ticker: string;
    name?: string;
    description?: string;
    primary_exchange?: string;
    market?: string;
    locale?: string;
    currency_name?: string;
    market_cap?: number;
    share_class_shares_outstanding?: number;
    homepage_url?: string;
    list_date?: string;
  }): StockDetails {
    return {
      ticker: raw.ticker,
      name: raw.name,
      description: raw.description,
      exchange: raw.primary_exchange,
      market: raw.market,
      locale: raw.locale,
      currency: raw.currency_name,
      marketCap: raw.market_cap,
      shareClassOutstanding: raw.share_class_shares_outstanding,
      homepage: raw.homepage_url,
      listDate: raw.list_date,
    };
  }

  private toStockQuoteFromTrade(
    ticker: string,
    raw: { p: number; s?: number; t: number }
  ): StockQuote {
    return {
      ticker,
      price: raw.p,
      size: raw.s,
      timestamp: new Date(raw.t / 1_000_000),
    };
  }

  private toStockQuoteFromQuote(
    ticker: string,
    raw: { p?: number; P?: number; s?: number; t: number }
  ): StockQuote {
    const price = raw.p ?? raw.P ?? 0;
    return {
      ticker,
      price,
      size: raw.s,
      timestamp: new Date(raw.t / 1_000_000),
    };
  }

  private toStockBar(
    ticker: string,
    raw: { o: number; h: number; l: number; c: number; v: number; t: number }
  ): StockBar {
    return {
      ticker,
      open: raw.o,
      high: raw.h,
      low: raw.l,
      close: raw.c,
      volume: raw.v,
      timestamp: new Date(raw.t),
    };
  }

  private formatDate(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  private toTimespanEnum(
    timespan: string
  ): GetStocksAggregatesTimespanEnum {
    const map: Record<string, GetStocksAggregatesTimespanEnum> = {
      second: GetStocksAggregatesTimespanEnum.Second,
      minute: GetStocksAggregatesTimespanEnum.Minute,
      hour: GetStocksAggregatesTimespanEnum.Hour,
      day: GetStocksAggregatesTimespanEnum.Day,
      week: GetStocksAggregatesTimespanEnum.Week,
      month: GetStocksAggregatesTimespanEnum.Month,
      quarter: GetStocksAggregatesTimespanEnum.Quarter,
      year: GetStocksAggregatesTimespanEnum.Year,
    };
    return map[timespan.toLowerCase()] ?? GetStocksAggregatesTimespanEnum.Day;
  }
}
