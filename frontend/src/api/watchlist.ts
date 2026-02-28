import { createApiService } from './client'

export interface WatchlistItemWithQuote {
  id: string
  ticker: string
  createdAt: string
  price?: number
  priceTimestamp?: string
}

export interface DashboardWatchlistResponse {
  items: WatchlistItemWithQuote[]
}

const watchlistService = createApiService('/api')

export async function fetchDashboardWatchlist(): Promise<WatchlistItemWithQuote[]> {
  const res = await watchlistService.get<DashboardWatchlistResponse>('/watchlists/dashboard')
  return res.data.items
}
