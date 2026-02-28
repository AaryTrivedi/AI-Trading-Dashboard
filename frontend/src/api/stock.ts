import { createApiService } from './client'

export interface StockOverviewResponse {
  ticker: string
  quote: { price: number; timestamp?: string } | null
  details: { name?: string; marketCap?: number; currency?: string } | null
  prevClose: number | null
  dailyChangePercent: number | null
  dailyChangeDollar: number | null
  chartData: Array<{
    date?: string
    open: number
    high: number
    low: number
    close: number
    volume: number
  }>
}

const stockService = createApiService('/api')

export async function fetchStockOverview(ticker: string): Promise<StockOverviewResponse> {
  const res = await stockService.get<StockOverviewResponse>(
    `/stocks/${encodeURIComponent(ticker.toUpperCase())}/overview`,
    { skipAuth: true }
  )
  return res.data
}
