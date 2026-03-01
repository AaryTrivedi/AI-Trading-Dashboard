import { createApiService } from './client'

export interface NewsItem {
  _id: string
  url_hash: string
  url: string
  canonical_url: string
  headline: string
  publishedAt: string
  source?: string
  tickers: string[]
  impact: number
  direction: 'positive' | 'negative' | 'mixed' | 'unclear'
  category:
    | 'EARNINGS'
    | 'MERGER_ACQUISITION'
    | 'REGULATORY_LEGAL'
    | 'MACRO'
    | 'ANALYST_RATING'
    | 'PRODUCT'
    | 'MANAGEMENT_CHANGE'
    | 'SUPPLY_CHAIN'
    | 'INSIDER_TRADING'
    | 'OTHER'
  points: string[]
  confidence: number
  model: string
  prompt_version: string
}

export interface ListNewsResponse {
  items: NewsItem[]
  total: number
  limit: number
  offset: number
}

const newsService = createApiService('/api')

export async function fetchNewsByTicker(
  ticker: string,
  limit = 5
): Promise<NewsItem[]> {
  const res = await newsService.get<ListNewsResponse>(
    `/news?tickers=${encodeURIComponent(ticker.toUpperCase())}&limit=${limit}`,
    { skipAuth: true }
  )
  return res.data.items
}
