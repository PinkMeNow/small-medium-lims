import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Card, CardBody } from '@heroui/react'
import { useAuthStore } from '../stores/auth.store'
import { login } from '../api/auth.api'

export default function Login() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [email, setEmail] = useState('')
  const [lozinka, setLozinka] = useState('')
  const [greška, setGreška] = useState('')
  const [učitava, setUčitava] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setGreška('')
    setUčitava(true)
    try {
      const { accessToken, user } = await login({ email, password: lozinka })
      setAuth(user, accessToken)
      navigate('/', { replace: true })
    } catch (err: any) {
      setGreška(err?.response?.data?.error?.message ?? 'Prijava nije uspjela.')
    } finally {
      setUčitava(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">LIMS</h1>
          <p className="text-sm text-muted mt-1">Laboratorijski informacijski sustav</p>
        </div>

        <Card>
          <CardBody className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onValueChange={setEmail}
                autoComplete="email"
                isRequired
                autoFocus
              />
              <Input
                label="Lozinka"
                type="password"
                value={lozinka}
                onValueChange={setLozinka}
                autoComplete="current-password"
                isRequired
              />
              {greška && (
                <p className="text-sm text-danger">{greška}</p>
              )}
              <Button
                type="submit"
                color="primary"
                isLoading={učitava}
                className="w-full mt-1"
              >
                Prijava
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
