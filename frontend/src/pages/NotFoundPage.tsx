import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <Link to="/" className="text-primary hover:underline">
        Go home
      </Link>
    </div>
  )
}
