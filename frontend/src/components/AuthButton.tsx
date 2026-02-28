import { useAuth0 } from '@auth0/auth0-react'

export function AuthButton() {
  const { loginWithRedirect, logout, isAuthenticated, user, isLoading } = useAuth0()

  if (isLoading) {
    return (
      <div className="text-sm text-muted">Loading...</div>
    )
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-foreground">
          Welcome, <span className="font-medium">{user.name ?? user.email}</span>
        </span>
        <button
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          className="px-4 py-2 text-sm font-medium text-white bg-error rounded-lg hover:bg-error-hover transition-colors"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => loginWithRedirect()}
      className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
    >
      Login
    </button>
  )
}
