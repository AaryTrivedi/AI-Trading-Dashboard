import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Routes, Route } from 'react-router-dom'
import { setAccessTokenGetter, setOnUnauthorized } from './api'
import { AuthButton } from './components/AuthButton'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import './App.css'

function App() {
  const { getAccessTokenSilently, loginWithRedirect } = useAuth0()

  useEffect(() => {
    setAccessTokenGetter(() => getAccessTokenSilently())
    setOnUnauthorized(() => loginWithRedirect())
  }, [getAccessTokenSilently, loginWithRedirect])

  return (
    <>
      <header className="flex justify-end p-4 border-b border-gray-200">
        <AuthButton />
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  )
}

export default App
