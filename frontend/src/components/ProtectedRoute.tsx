import { Navigate } from 'react-router-dom'
import { Spinner } from '@heroui/react'
import { useAuthStore } from '../stores/auth.store'

interface Props {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const { user, isInitialising } = useAuthStore()

  if (isInitialising) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) return <Navigate to="/prijava" replace />

  return <>{children}</>
}
