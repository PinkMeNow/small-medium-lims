import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/auth.store'
import { refreshSession } from './api/auth.api'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'

function App() {
  const { setAuth, clearAuth } = useAuthStore()

  useEffect(() => {
    refreshSession()
      .then(({ accessToken, user }) => setAuth(user, accessToken))
      .catch(() => clearAuth())
  }, [])

  return (
    <Routes>
      <Route path="/prijava" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-background flex items-center justify-center">
              <p className="text-foreground text-lg">Dobrodošli u LIMS</p>
            </div>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
