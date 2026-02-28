import type { Request, Response } from 'express';
import { stockDataProvider } from '../../providers/index.js';

export async function getStockOverview(req: Request, res: Response): Promise<void> {
  const ticker = (req.params.ticker || '').trim().toUpperCase();
  if (!ticker) {
    res.status(400).json({ error: 'Ticker is required' });
    return;
  }

  const [quote, details, aggregates] = await Promise.all([
    stockDataProvider.getLastQuote(ticker),
    stockDataProvider.getTickerDetails(ticker),
    stockDataProvider.getAggregates
      ? stockDataProvider.getAggregates(
          ticker,
          new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          new Date(),
          'day'
        )
      : Promise.resolve([]),
  ]);

  const bars = aggregates ?? [];
  const prevClose =
    bars.length >= 2 ? bars[bars.length - 2]?.close : bars[0]?.open ?? quote?.price;
  const currentPrice = quote?.price ?? bars[bars.length - 1]?.close;
  const dailyChange =
    currentPrice != null && prevClose != null && prevClose > 0
      ? ((currentPrice - prevClose) / prevClose) * 100
      : null;
  const dailyChangeDollar =
    currentPrice != null && prevClose != null ? currentPrice - prevClose : null;

  res.json({
    ticker,
    quote: quote
      ? {
          price: quote.price,
          timestamp: quote.timestamp?.toISOString(),
        }
      : null,
    details: details
      ? {
          name: details.name,
          marketCap: details.marketCap,
          currency: details.currency,
        }
      : null,
    prevClose: prevClose ?? null,
    dailyChangePercent: dailyChange,
    dailyChangeDollar,
    chartData: bars.map((b) => ({
      date: b.timestamp?.toISOString?.()?.slice(0, 10),
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
      volume: b.volume,
    })),
  });
}
