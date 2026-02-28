import { useCallback, useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Link } from 'react-router-dom'
import * as Popover from '@radix-ui/react-popover'
import { AuthStatus } from '../components/AuthStatus'
import {
  fetchDashboardWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  type WatchlistItemWithQuote,
} from '../api/watchlist'

export function WatchlistPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth0()
  const [items, setItems] = useState<WatchlistItemWithQuote[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tickerInput, setTickerInput] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)

  const loadWatchlist = useCallback(() => {
    if (!isAuthenticated) return
    setLoading(true)
    setError(null)
    fetchDashboardWatchlist()
      .then(setItems)
      .catch((err) => {
        const msg = err.response?.data?.error?.message ?? err.message ?? 'Failed to load watchlist'
        setError(msg)
        setItems([])
      })
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([])
      setError(null)
      return
    }
    loadWatchlist()
  }, [isAuthenticated, loadWatchlist])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const ticker = tickerInput.trim().toUpperCase()
    if (!ticker) return
    setAdding(true)
    setAddError(null)
    try {
      await addToWatchlist(ticker)
      setTickerInput('')
      setPopoverOpen(false)
      loadWatchlist()
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data
      const msg = data?.error?.message ?? (err as Error)?.message ?? 'Failed to add'
      setAddError(msg)
    } finally {
      setAdding(false)
    }
  }

  const handleRemove = async (id: string) => {
    try {
      await removeFromWatchlist(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch {
      loadWatchlist()
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Watchlist
      </h1>
      <p className="mt-4 text-muted">
        Add stocks to track on your dashboard.
      </p>

      {authLoading ? (
        <p className="mt-10 text-muted">Checking authentication…</p>
      ) : !isAuthenticated ? (
        <div className="mt-10 max-w-xl">
          <p className="mb-6 text-muted">
            Sign in to manage your watchlist.
          </p>
          <AuthStatus />
        </div>
      ) : (
        <div className="mt-10 space-y-8">
          <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
            <Popover.Trigger asChild>
              <button
                type="button"
                className="rounded-lg bg-primary px-4 py-2 font-medium text-white shadow-primary transition hover:bg-primary-hover"
              >
                Add to watchlist
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className="z-50 w-80 rounded-xl border border-border bg-surface p-4 shadow-lg outline-none"
                sideOffset={8}
                align="start"
              >
                <form onSubmit={handleAdd} className="space-y-3">
                  <label htmlFor="ticker" className="block text-sm font-medium text-foreground">
                    Ticker symbol
                  </label>
                  <input
                    id="ticker"
                    type="text"
                    value={tickerInput}
                    onChange={(e) => setTickerInput(e.target.value)}
                    placeholder="e.g. AAPL"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    disabled={adding}
                    maxLength={10}
                  />
                  {addError && (
                    <p className="text-sm text-error">{addError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={adding || !tickerInput.trim()}
                    className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {adding ? 'Adding…' : 'Add'}
                  </button>
                </form>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          {loading ? (
            <p className="text-muted">Loading your watchlist…</p>
          ) : error ? (
            <p className="text-error">{error}</p>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center">
              <p className="text-muted">No stocks in your watchlist yet.</p>
              <p className="mt-2 text-sm text-muted">
                Enter a ticker above to add one.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                Your watchlist ({items.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 shadow-sm"
                  >
                    <div>
                      <span className="text-lg font-bold text-foreground">
                        {item.ticker}
                      </span>
                      {item.price != null && (
                        <span className="ml-2 text-muted">
                          ${item.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/stock/${item.ticker}`}
                        className="text-sm text-primary hover:underline"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="text-sm text-error hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/dashboard"
                className="inline-block text-sm text-primary hover:underline"
              >
                ← Back to dashboard
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
