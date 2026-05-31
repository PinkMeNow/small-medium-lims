import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import * as service from './dashboard.service'

export const dashboardRouter = Router()

dashboardRouter.use(requireAuth)

dashboardRouter.get('/stats', async (_req, res) => {
  res.json(await service.getStats())
})

dashboardRouter.get('/activity', async (_req, res) => {
  res.json(await service.getRecentActivity())
})
