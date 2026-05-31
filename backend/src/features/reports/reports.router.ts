import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { AppError } from '../../middleware/error'
import * as service from './reports.service'

export const reportsRouter = Router()
reportsRouter.use(requireAuth)

reportsRouter.get('/samples', async (req, res) => {
  const { from, to, status } = req.query as Record<string, string | undefined>
  res.json(await service.samplesReport(from, to, status))
})

reportsRouter.get('/chemicals', async (_req, res) => {
  res.json(await service.chemicalsReport())
})

reportsRouter.get('/experiments', async (req, res) => {
  const { from, to, protocolId } = req.query as Record<string, string | undefined>
  res.json(await service.experimentsReport(from, to, protocolId))
})

reportsRouter.get('/chain-of-custody/:sampleId', async (req, res) => {
  const result = await service.chainOfCustody(String(req.params.sampleId))
  if (!result) throw new AppError(404, 'NIJE_PRONAĐENO', 'Uzorak nije pronađen.')
  res.json(result)
})
