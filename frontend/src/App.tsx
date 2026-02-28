import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Routes, Route } from 'react-router-dom'
import { setAccessTokenGetter, setOnUnauthorized } from './api'
import { Layout } from './components/layout/Layout'
import { LandingPage } from './pages/LandingPage'
import { DashboardPage } from './pages/DashboardPage'
import { WatchlistPage } from './pages/WatchlistPage'
import { NotFoundPage } from './pages/NotFoundPage'
import './App.css'

function App() {
  const { getAccessTokenSilently, loginWithRedirect } = useAuth0()

  useEffect(() => {
    setAccessTokenGetter(() => getAccessTokenSilently())
    setOnUnauthorized(() => loginWithRedirect())
  }, [getAccessTokenSilently, loginWithRedirect])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="watchlist" element={<WatchlistPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
