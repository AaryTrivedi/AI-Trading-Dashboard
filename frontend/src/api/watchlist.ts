import { createApiService } from './client'

export interface WatchlistItemWithQuote {
  id: string
  ticker: string
  createdAt: string
  price?: number
  priceTimestamp?: string
}

export interface WatchlistItem {
  _id: string
  ticker: string
  createdAt: string
}

/** Raw list response from GET /watchlists */
export interface ListWatchlistResponse {
  items: WatchlistItem[]
  total: number
  limit: number
  offset: number
}

export interface DashboardWatchlistResponse {
  items: WatchlistItemWithQuote[]
}

const watchlistService = createApiService('/api')

export async function fetchDashboardWatchlist(): Promise<WatchlistItemWithQuote[]> {
  const res = await watchlistService.get<DashboardWatchlistResponse>('/watchlists/dashboard')
  return res.data.items
}

export async function addToWatchlist(ticker: string): Promise<WatchlistItem> {
  const res = await watchlistService.post<WatchlistItem>('/watchlists', { ticker })
  return res.data
}

export async function removeFromWatchlist(id: string): Promise<void> {
  await watchlistService.delete(`/watchlists/${id}`)
}
