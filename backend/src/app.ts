import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { authRouter } from './features/auth/auth.router'
import { samplesRouter } from './features/samples/samples.router'
import { chemicalsRouter } from './features/chemicals/chemicals.router'
import { errorMiddleware } from './middleware/error'
import { env } from './lib/env'

export const app = express()

app.use(cors({
  origin: env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV })
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/samples', samplesRouter)
app.use('/api/v1/chemicals', chemicalsRouter)

app.use(errorMiddleware)
