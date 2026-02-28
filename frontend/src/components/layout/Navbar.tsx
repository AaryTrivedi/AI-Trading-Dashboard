import { Link } from 'react-router-dom'
import { AuthButton } from '../AuthButton'

const navLinks = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Watchlist', to: '/watchlist' },
  { label: 'How It Works', to: '/#how-it-works' },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 lg:px-8">
        <Link to="/" className="text-xl font-semibold tracking-tight text-slate-900">
          AIPowered Trading
        </Link>
        <div className="flex items-center gap-6 sm:gap-8">
          {navLinks.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              {label}
            </Link>
          ))}
          <AuthButton />
        </div>
      </nav>
    </header>
  )
}
