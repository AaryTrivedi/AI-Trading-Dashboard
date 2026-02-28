import { createApiService } from './client'

export interface NewsItem {
  _id: string
  url: string
  title: string
  publishedAt: string
  source?: string
  tickers: string[]
  aiSummary: string
  impactCategory: string
  impactType: string
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
