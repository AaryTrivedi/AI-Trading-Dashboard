import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchNewsByTicker, type NewsItem } from '../api/news'

export function StockPage() {
  const { ticker } = useParams<{ ticker: string }>()
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ticker) return
    setLoading(true)
    setError(null)
    fetchNewsByTicker(ticker, 5)
      .then(setNews)
      .catch((err) => {
        setError(err.response?.data?.error?.message ?? err.message ?? 'Failed to load news')
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

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
      <div className="mb-8 flex items-center gap-4">
        <Link to="/dashboard" className="text-primary hover:underline">
          ← Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {tickerUpper}
        </h1>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          News
        </h2>
        {loading ? (
          <p className="text-muted">Loading news…</p>
        ) : error ? (
          <p className="text-error">{error}</p>
        ) : news.length === 0 ? (
          <p className="text-muted">No news found for this stock in the database.</p>
        ) : (
          <div className="space-y-4">
            {news.map((item) => (
              <article
                key={item._id}
                className="rounded-xl border border-border bg-surface p-4 shadow-sm"
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground hover:text-primary hover:underline"
                >
                  {item.title}
                </a>
                {(item.source || item.publishedAt) && (
                  <p className="mt-1 text-sm text-muted">
                    {[item.source, item.publishedAt && new Date(item.publishedAt).toLocaleDateString()]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}
                {item.aiSummary && (
                  <p className="mt-2 text-sm text-muted">{item.aiSummary}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
