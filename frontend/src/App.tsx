import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/auth.store'
import { refreshSession } from './api/auth.api'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/layout/AppShell'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

const Placeholder = ({ naziv }: { naziv: string }) => (
  <div className="flex flex-col gap-2">
    <h1 className="text-2xl font-semibold text-foreground">{naziv}</h1>
    <p className="text-sm text-muted">Modul je u izradi.</p>
  </div>
)

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

      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="/"             element={<Dashboard />} />
        <Route path="/uzorci"       element={<Placeholder naziv="Uzorci" />} />
        <Route path="/kemikalije"   element={<Placeholder naziv="Kemikalije" />} />
        <Route path="/protokoli"    element={<Placeholder naziv="Protokoli" />} />
        <Route path="/izvještaji"   element={<Placeholder naziv="Izvještaji" />} />
        <Route path="/korisnici"    element={<Placeholder naziv="Korisnici" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
