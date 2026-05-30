import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, CardContent, Input, Label, Spinner, TextField } from '@heroui/react'
import { FlaskConical } from 'lucide-react'
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

        <div className="flex flex-col items-center gap-2">
          <div className="p-3 rounded-xl bg-accent-soft text-accent">
            <FlaskConical size={28} />
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">LIMS</h1>
          <p className="text-sm text-muted">Laboratorijski informacijski sustav</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              <TextField value={email} onChange={setEmail}>
                <Label className="text-sm font-medium text-foreground">Email</Label>
                <Input
                  type="email"
                  autoComplete="email"
                  autoFocus
                  required
                  className="mt-1"
                />
              </TextField>

              <TextField value={lozinka} onChange={setLozinka}>
                <Label className="text-sm font-medium text-foreground">Lozinka</Label>
                <Input
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-1"
                />
              </TextField>

              {greška && (
                <p className="text-sm text-danger">{greška}</p>
              )}

              <Button
                type="submit"
                variant="primary"
                isDisabled={učitava}
                fullWidth
                className="mt-1"
              >
                {učitava ? <Spinner size="sm" /> : 'Prijava'}
              </Button>

            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
