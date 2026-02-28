/** Shared DTOs used across news and stock data providers */

export interface NewsItem {
  url: string;
  title: string;
  publishedAt: Date;
  source?: string;
  tickers: string[];
}

export interface StockDetails {
  ticker: string;
  name?: string;
  description?: string;
  exchange?: string;
  market?: string;
  locale?: string;
  currency?: string;
  marketCap?: number;
  shareClassOutstanding?: number;
  homepage?: string;
  listDate?: string;
}

export interface StockQuote {
  ticker: string;
  price: number;
  size?: number;
  timestamp: Date;
}

export interface StockBar {
  ticker: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: Date;
}
