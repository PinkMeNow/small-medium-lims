import { Router } from 'express'
import { loginSchema } from './auth.schema'
import * as authService from './auth.service'
import { requireAuth } from '../../middleware/auth'
import { AppError } from '../../middleware/error'

const COOKIE = 'refresh_token'
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth',
}

export const authRouter = Router()

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError(400, 'NEVAŽEĆI_ZAHTJEV', parsed.error.errors[0].message)
  }
  const { accessToken, refreshToken, user } = await authService.login(parsed.data)
  res.cookie(COOKIE, refreshToken, COOKIE_OPTS)
  res.json({ accessToken, user })
})

authRouter.post('/refresh', async (req, res) => {
  const raw = req.cookies?.[COOKIE]
  if (!raw) throw new AppError(401, 'NEVAŽEĆI_TOKEN', 'Token nije pronađen.')
  const { accessToken, user } = await authService.refresh(raw)
  res.json({ accessToken, user })
})

authRouter.post('/logout', async (req, res) => {
  const raw = req.cookies?.[COOKIE]
  if (raw) await authService.logout(raw)
  res.clearCookie(COOKIE, { ...COOKIE_OPTS, maxAge: undefined })
  res.json({ poruka: 'Uspješno ste se odjavili.' })
})

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})
