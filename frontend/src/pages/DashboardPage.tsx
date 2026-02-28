import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Link } from 'react-router-dom'
import { AuthStatus } from '../components/AuthStatus'
import { fetchDashboardWatchlist, type WatchlistItemWithQuote } from '../api/watchlist'

export function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth0()
  const [items, setItems] = useState<WatchlistItemWithQuote[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([])
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    fetchDashboardWatchlist()
      .then(setItems)
      .catch((err) => {
        setError(err.response?.data?.error?.message ?? err.message ?? 'Failed to load watchlist')
        setItems([])
      })
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Dashboard
      </h1>
      <p className="mt-4 text-muted">
        Your watchlisted stocks at a glance.
      </p>

      {authLoading ? (
        <p className="mt-10 text-muted">Checking authentication…</p>
      ) : !isAuthenticated ? (
        <div className="mt-10 max-w-xl">
          <p className="mb-6 text-muted">
            Sign in to see your watchlisted stocks on the dashboard.
          </p>
          <AuthStatus />
        </div>
      ) : (
        <div className="mt-10">
          {loading ? (
            <p className="text-muted">Loading your watchlist…</p>
          ) : error ? (
            <p className="text-error">{error}</p>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center">
              <p className="text-muted">No stocks in your watchlist yet.</p>
              <Link
                to="/watchlist"
                className="mt-4 inline-block text-primary hover:underline"
              >
                Add stocks to your watchlist →
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-foreground">
                      {item.ticker}
                    </span>
                    {item.price != null ? (
                      <span className="text-lg font-semibold text-foreground">
                        ${item.price.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-sm text-muted">—</span>
                    )}
                  </div>
                  {item.priceTimestamp && (
                    <p className="mt-2 text-xs text-muted">
                      Updated {new Date(item.priceTimestamp).toLocaleString()}
                    </p>
                  )}
                  <Link
                    to={`/stock/${item.ticker}`}
                    className="mt-3 inline-block text-sm text-primary hover:underline"
                  >
                    View →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
