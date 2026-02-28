import type { StockDetails, StockQuote, StockBar } from './types.js';

export interface StockDataProvider {
  listTickers(search?: string): Promise<StockDetails[]>;
  getTickerDetails(ticker: string): Promise<StockDetails | null>;
  getLastTrade(ticker: string): Promise<StockQuote | null>;
  getLastQuote(ticker: string): Promise<StockQuote | null>;
  getAggregates?(
    ticker: string,
    from: Date,
    to: Date,
    timespan?: string
  ): Promise<StockBar[]>;
}
