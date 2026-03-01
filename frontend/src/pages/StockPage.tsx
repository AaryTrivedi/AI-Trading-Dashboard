import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fetchNewsByTicker, type NewsItem } from '../api/news'
import { fetchStockOverview, type StockOverviewResponse } from '../api/stock'

type ViewMode = 'simple' | 'advanced'

const IMPACT_DIRECTION: Record<string, 'Up' | 'Down' | 'Neutral'> = {
  positive: 'Up',
  negative: 'Down',
  mixed: 'Neutral',
  unclear: 'Neutral',
}

function getImpactLabel(score: number): 'Low' | 'Medium' | 'High' {
  if (score >= 8) return 'High'
  if (score >= 5) return 'Medium'
  return 'Low'
}

function formatTimeAgo(date: string): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  return `${diffDays} days ago`
}

function getTakeaway(dailyChange: number | null): string {
  if (dailyChange == null) return 'Data is loading. Check back in a moment.'
  const abs = Math.abs(dailyChange)
  if (abs < 0.5) {
    return 'Short-term outlook: Mostly flat. No major moves expected right now.'
  }
  if (abs < 2) {
    return dailyChange > 0
      ? 'Short-term outlook: Slightly positive, but volatility expected.'
      : 'Short-term outlook: Slightly down. Normal market fluctuation.'
  }
  if (abs < 5) {
    return dailyChange > 0
      ? 'Short-term outlook: Up today. Watch for any news that could reverse this.'
      : 'Short-term outlook: Down today. Consider waiting before making decisions.'
  }
  return dailyChange > 0
    ? 'Short-term outlook: Big move up. High volatility—proceed with caution.'
    : 'Short-term outlook: Big move down. High volatility—avoid panic selling.'
}

function getRiskScore(dailyChangePercent: number | null): number {
  if (dailyChangePercent == null) return 5
  const abs = Math.abs(dailyChangePercent)
  if (abs < 1) return 2
  if (abs < 3) return 4
  if (abs < 5) return 6
  if (abs < 8) return 8
  return 9
}

function getRiskExplanation(score: number): string {
  if (score <= 3) return 'This stock is relatively stable right now. Price swings are small.'
  if (score <= 5) return 'Moderate risk. Some ups and downs are normal for stocks.'
  if (score <= 7) return 'Higher volatility. Bigger price swings than usual.'
  return 'High volatility. Expect significant price movement.'
}

function getNormalMoveStatement(dailyChangePercent: number | null): string {
  if (dailyChangePercent == null) return 'Loading price data…'
  const abs = Math.abs(dailyChangePercent)
  if (abs < 2) return 'This stock often moves 1–3% daily. Today\'s move is normal.'
  if (abs < 5) return 'This stock often moves 3–5% daily. Today\'s move is within normal volatility.'
  return 'Today\'s move is larger than usual. Stay calm—big swings happen.'
}

function getTechnicalStrength(chartData: { close: number }[], currentPrice: number): number {
  if (!chartData.length) return 5
  const recent = chartData.slice(-10)
  const avg = recent.reduce((s, b) => s + b.close, 0) / recent.length
  const diff = ((currentPrice - avg) / avg) * 100
  if (diff > 5) return 8
  if (diff > 2) return 7
  if (diff > 0) return 6
  if (diff > -2) return 5
  if (diff > -5) return 4
  return 3
}

function getNewsSentimentScore(news: NewsItem[]): number {
  if (!news.length) return 5
  let sum = 0
  for (const n of news) {
    if (n.direction === 'positive') sum += 7
    else if (n.direction === 'negative') sum += 3
    else sum += 5
  }
  return Math.round(Math.min(10, Math.max(0, sum / news.length)))
}

const MOCK_UPCOMING_EVENTS = [
  { name: 'Earnings Report', date: 'In 2 weeks', volatility: 'Medium' as const },
  { name: 'Fed Interest Rate Decision', date: 'Mar 15', volatility: 'High' as const },
]

export function StockPage() {
  const { ticker } = useParams<{ ticker: string }>()
  const [viewMode, setViewMode] = useState<ViewMode>('simple')
  const [overview, setOverview] = useState<StockOverviewResponse | null>(null)
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedNewsId, setExpandedNewsId] = useState<string | null>(null)
  const [whatMovedItPage, setWhatMovedItPage] = useState(1)

  const WHAT_MOVED_IT_PAGE_SIZE = 5
  const whatMovedItTotalPages = Math.max(1, Math.ceil(news.length / WHAT_MOVED_IT_PAGE_SIZE))
  const effectiveWhatMovedItPage = Math.min(whatMovedItPage, whatMovedItTotalPages)
  const whatMovedItPaginated = news.slice(
    (effectiveWhatMovedItPage - 1) * WHAT_MOVED_IT_PAGE_SIZE,
    effectiveWhatMovedItPage * WHAT_MOVED_IT_PAGE_SIZE
  )

  useEffect(() => {
    if (!ticker) return
    setLoading(true)
    setError(null)
    setWhatMovedItPage(1)
    Promise.all([
      fetchStockOverview(ticker),
      fetchNewsByTicker(ticker, 8),
    ])
      .then(([ov, nws]) => {
        setOverview(ov)
        setNews(nws)
      })
      .catch((err) => {
        setError(err.response?.data?.error?.message ?? err.message ?? 'Failed to load stock data')
        setOverview(null)
        setNews([])
      })
      .finally(() => setLoading(false))
  }, [ticker])

  if (!ticker) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <p className="text-muted">No ticker specified.</p>
        <Link to="/dashboard" className="mt-4 inline-block text-primary hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    )
  }

  const tickerUpper = ticker.toUpperCase()

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 w-48 rounded-xl bg-border" />
          <div className="h-32 rounded-2xl bg-border" />
          <div className="h-24 rounded-2xl bg-border" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <p className="text-error">{error}</p>
        <Link to="/dashboard" className="mt-4 inline-block text-primary hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    )
  }

  const price = overview?.quote?.price ?? 0
  const dailyChangePercent = overview?.dailyChangePercent ?? 0
  const dailyChangeDollar = overview?.dailyChangeDollar ?? 0
  const chartData = overview?.chartData ?? []
  const companyName = overview?.details?.name ?? tickerUpper

  const technicalStrength = getTechnicalStrength(chartData, price)
  const newsSentiment = getNewsSentimentScore(news)
  const institutionalActivity = 5 // Placeholder
  const riskScore = getRiskScore(dailyChangePercent)
  const aiConfidence = news.length >= 3 ? 'High' : news.length >= 1 ? 'Medium' : 'Low'
  const takeaway = getTakeaway(dailyChangePercent)

  const aiSummaryBullets = [
    news.length > 0 && news[0].points.length > 0
      ? news[0].points[0]
      : dailyChangePercent >= 0
        ? `The stock is up ${dailyChangePercent.toFixed(1)}% today. That usually means more buyers than sellers.`
        : `The stock is down ${Math.abs(dailyChangePercent).toFixed(1)}% today. That usually means more sellers than buyers.`,
    chartData.length > 0
      ? `Over the past few months, the price has been ${price >= (chartData[0]?.close ?? price) ? 'trending up' : 'trending down'}.`
      : 'Historical price data is still loading.',
    'Keep an eye on any big news—it can move the stock quickly.',
  ].filter(Boolean)

  const rsi = 52 // Placeholder
  const maTrend = chartData.length >= 2 && price >= (chartData[chartData.length - 1]?.close ?? 0) ? 'Up' : 'Down'
  const unusualOptions = 'No' // Placeholder

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-8 lg:px-8">
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/dashboard" className="text-primary hover:underline">
          ← Dashboard
        </Link>
        <div
          className="inline-flex rounded-xl border border-border bg-surface p-1"
          role="tablist"
          aria-label="View mode"
        >
          <button
            role="tab"
            aria-selected={viewMode === 'simple'}
            onClick={() => setViewMode('simple')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              viewMode === 'simple'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Simple View
          </button>
          <button
            role="tab"
            aria-selected={viewMode === 'advanced'}
            onClick={() => setViewMode('advanced')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              viewMode === 'advanced'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Advanced View
          </button>
        </div>
      </div>

      {/* 1) HEADER SECTION */}
      <header className="mb-8 rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wider text-muted">
          {tickerUpper}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground sm:text-3xl">
          {companyName}
        </h1>
        <p className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          ${price.toFixed(2)}
        </p>
        <div className="mt-2 flex items-baseline gap-3">
          <span
            className={`text-xl font-semibold ${
              dailyChangeDollar >= 0 ? 'text-success' : 'text-error'
            }`}
          >
            {dailyChangeDollar >= 0 ? '+' : ''}
            {dailyChangeDollar.toFixed(2)} ({dailyChangePercent >= 0 ? '+' : ''}
            {dailyChangePercent.toFixed(2)}%)
          </span>
        </div>
        <p className="mt-6 text-lg font-medium text-foreground">
          {takeaway}
        </p>
      </header>

      {/* Price Chart - Advanced view only, right after header */}
      {viewMode === 'advanced' && chartData.length > 0 && (
        <section className="mb-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted">Price (last 90 days)</h3>
          <div className="mt-2 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) =>
                    v ? new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
                  }
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  formatter={(v) => (v != null ? [`$${Number(v).toFixed(2)}`, 'Close'] : null)}
                  labelFormatter={(v) => (v ? new Date(v).toLocaleDateString() : '')}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* 2) AI SUMMARY + 3) WHAT'S DRIVING - side by side */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">AI Summary</h2>
          <ul className="mt-4 space-y-2">
            {aiSummaryBullets.map((bullet, i) => (
              <li key={i} className="flex gap-2 text-muted">
                <span className="text-primary">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                aiConfidence === 'High'
                  ? 'bg-success/20 text-success'
                  : aiConfidence === 'Medium'
                    ? 'bg-warning-bg text-warning-text'
                    : 'bg-muted/20 text-muted'
              }`}
            >
              AI Confidence: {aiConfidence}
            </span>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            What&apos;s Driving This Stock?
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                label: 'Technical Strength',
                score: technicalStrength,
                explanation:
                  technicalStrength >= 7
                    ? 'Price is trending up compared to recent history.'
                    : technicalStrength <= 4
                      ? 'Price is trending down compared to recent history.'
                      : 'Price is moving sideways—no clear trend.',
              },
              {
                label: 'News Sentiment',
                score: newsSentiment,
                explanation:
                  newsSentiment >= 7
                    ? 'Recent news is mostly positive.'
                    : newsSentiment <= 4
                      ? 'Recent news is mostly negative.'
                      : 'Recent news is mixed.',
              },
              {
                label: 'Institutional Activity',
                score: institutionalActivity,
                explanation: 'Big investors are holding steady.',
              },
            ].map(({ label, score, explanation }) => (
              <div key={label}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{label}</span>
                  <span className="text-sm font-semibold text-foreground">{score}/10</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${score * 10}%` }}
                  />
                </div>
                <p className="mt-1 text-sm text-muted">{explanation}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 4) WHAT MOVED IT? */}
      <section className="mb-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">What Moved It?</h2>
        {news.length === 0 ? (
          <p className="mt-4 text-muted">No recent drivers in our database yet.</p>
        ) : (
          <>
            <ul className="mt-4 space-y-3">
              {whatMovedItPaginated.map((item) => {
              const isExpanded = expandedNewsId === item._id
              const impact = getImpactLabel(item.impact)
              const direction = IMPACT_DIRECTION[item.direction] ?? 'Neutral'
              return (
                <li
                  key={item._id}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <div className="flex items-start gap-2">
                    <button
                      onClick={() =>
                        setExpandedNewsId(isExpanded ? null : item._id)
                      }
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="font-medium text-foreground">{item.headline}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded bg-muted/30 px-2 py-0.5 text-xs text-muted">
                          Impact: {impact}
                        </span>
                        <span className="rounded bg-muted/30 px-2 py-0.5 text-xs text-muted">
                          {direction}
                        </span>
                        <span className="text-xs text-muted">
                          {formatTimeAgo(item.publishedAt)}
                        </span>
                      </div>
                    </button>
                    <a
                      href={item.canonical_url || item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 shrink-0 rounded p-1.5 text-muted transition-colors hover:bg-muted/50 hover:text-foreground"
                      title="Open article in new tab"
                      aria-label="Open article in new tab"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </div>
                  {isExpanded && item.points.length > 0 && (
                    <div className="mt-4 border-t border-border pt-4">
                      <p className="text-sm font-medium text-foreground">
                        Explain Like I&apos;m 15
                      </p>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted">
                        {item.points.map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              )
            })}
            </ul>
            {whatMovedItTotalPages > 1 && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <p className="text-sm text-muted">
                  Showing {(effectiveWhatMovedItPage - 1) * WHAT_MOVED_IT_PAGE_SIZE + 1}–
                  {Math.min(
                    effectiveWhatMovedItPage * WHAT_MOVED_IT_PAGE_SIZE,
                    news.length
                  )}{' '}
                  of {news.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWhatMovedItPage((p) => Math.max(1, p - 1))}
                    disabled={effectiveWhatMovedItPage <= 1}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted">
                    Page {effectiveWhatMovedItPage} of {whatMovedItTotalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setWhatMovedItPage((p) => Math.min(whatMovedItTotalPages, p + 1))
                    }
                    disabled={effectiveWhatMovedItPage >= whatMovedItTotalPages}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* 5) RISK PANEL + 6) UPCOMING EVENTS - side by side */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Risk Level</h2>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{riskScore}</span>
            <span className="text-muted">/ 10</span>
          </div>
          <p className="mt-2 text-muted">{getRiskExplanation(riskScore)}</p>
          <p className="mt-4 rounded-lg bg-muted/10 p-3 text-sm text-foreground">
            {getNormalMoveStatement(dailyChangePercent)}
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Upcoming Events</h2>
          <ul className="mt-4 space-y-3">
            {MOCK_UPCOMING_EVENTS.map((ev) => (
              <li
                key={ev.name}
                className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
              >
                <div>
                  <p className="font-medium text-foreground">{ev.name}</p>
                  <p className="text-sm text-muted">{ev.date}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    ev.volatility === 'High'
                      ? 'bg-error/20 text-error'
                      : ev.volatility === 'Medium'
                        ? 'bg-warning-bg text-warning-text'
                        : 'bg-muted/20 text-muted'
                  }`}
                >
                  {ev.volatility} volatility
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 7) ADVANCED VIEW - Key Metrics & Signals */}
      {viewMode === 'advanced' && (
        <section className="mb-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            Advanced Analysis
          </h2>

          {/* Key Metrics Grid */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-muted">Key Metrics</h3>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                {
                  label: 'Volume',
                  value: chartData.length
                    ? chartData[chartData.length - 1]?.volume?.toLocaleString() ?? '—'
                    : '—',
                },
                {
                  label: 'Market Cap',
                  value: overview?.details?.marketCap
                    ? `$${(overview.details.marketCap / 1e9).toFixed(2)}B`
                    : '—',
                },
                { label: 'P/E Ratio', value: '—' },
                { label: 'EPS', value: '—' },
                { label: 'Beta', value: '—' },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-lg border border-border bg-background p-3"
                >
                  <p className="text-xs text-muted">{label}</p>
                  <p className="mt-1 font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* C) Signals */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-muted">Signals</h3>
            <ul className="mt-2 space-y-2">
              <li className="flex justify-between rounded-lg border border-border bg-background px-4 py-2">
                <span className="text-muted">RSI</span>
                <span className="font-medium text-foreground">{rsi}</span>
              </li>
              <li className="flex justify-between rounded-lg border border-border bg-background px-4 py-2">
                <span className="text-muted">50/200 MA Trend</span>
                <span className="font-medium text-foreground">{maTrend}</span>
              </li>
              <li className="flex justify-between rounded-lg border border-border bg-background px-4 py-2">
                <span className="text-muted">Unusual Options Activity</span>
                <span className="font-medium text-foreground">{unusualOptions}</span>
              </li>
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}
