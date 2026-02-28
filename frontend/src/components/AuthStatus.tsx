import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { apiClient } from '../api/client'

type BackendState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; userId: string }
  | { status: 'error'; message: string }

export function AuthStatus() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth0()
  const [backend, setBackend] = useState<BackendState>({ status: 'idle' })

  useEffect(() => {
    if (!isAuthenticated) {
      setBackend({ status: 'idle' })
      return
    }
    setBackend({ status: 'loading' })
    apiClient
      .get<{ userId: string }>('/api/me')
      .then((res) => setBackend({ status: 'ok', userId: res.data.userId }))
      .catch((err) => {
        const message =
          err.response?.data?.error?.message ??
          err.message ??
          'Request failed'
        setBackend({ status: 'error', message })
      })
  }, [isAuthenticated])

  return (
    <section
      className="rounded-xl border border-border bg-surface p-6 shadow-sm"
      aria-label="Authentication status"
    >
      <h2 className="text-lg font-semibold text-foreground">
        Authentication status
      </h2>

      <div className="mt-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">Auth0 (frontend):</span>
          {authLoading ? (
            <span className="text-sm text-muted">Checking…</span>
          ) : isAuthenticated && user ? (
            <span className="text-sm font-medium text-foreground">
              Logged in as {user.name ?? user.email}
            </span>
          ) : (
            <span className="text-sm text-muted">Not logged in</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">Backend (JWT validated):</span>
          {!isAuthenticated ? (
            <span className="text-sm text-muted">—</span>
          ) : backend.status === 'loading' ? (
            <span className="text-sm text-muted">Checking…</span>
          ) : backend.status === 'ok' ? (
            <span className="text-sm font-medium text-success">
              ✓ Valid — userId: {backend.userId}
            </span>
          ) : backend.status === 'error' ? (
            <span className="text-sm text-error" title={backend.message}>
              ✗ {backend.message}
            </span>
          ) : (
            <span className="text-sm text-muted">—</span>
          )}
        </div>
      </div>
    </section>
  )
}
