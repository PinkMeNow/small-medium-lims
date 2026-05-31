import { Router } from 'express'
import { requireAuth, requireRole } from '../../middleware/auth'
import { AppError } from '../../middleware/error'
import {
  createProtocolSchema, newVersionSchema, createExperimentSchema,
  completeExperimentSchema, listProtocolsSchema, listExperimentsSchema,
} from './protocols.schema'
import * as service from './protocols.service'

export const protocolsRouter = Router()
export const experimentsRouter = Router()

protocolsRouter.use(requireAuth)
experimentsRouter.use(requireAuth)

// ─── Protocols ───────────────────────────────────────────────────────────────

protocolsRouter.get('/', async (req, res) => {
  const parsed = listProtocolsSchema.safeParse(req.query)
  if (!parsed.success) throw new AppError(400, 'NEVAŽEĆI_ZAHTJEV', parsed.error.errors[0].message)
  res.json(await service.listProtocols(parsed.data))
})

protocolsRouter.post('/', requireRole('admin', 'lab_technician'), async (req, res) => {
  const parsed = createProtocolSchema.safeParse(req.body)
  if (!parsed.success) throw new AppError(400, 'NEVAŽEĆI_ZAHTJEV', parsed.error.errors[0].message)
  const result = await service.createProtocol(parsed.data, req.user!.id, req.ip)
  res.status(201).json(result)
})

protocolsRouter.get('/:id', async (req, res) => {
  res.json(await service.getProtocolById(String(req.params.id)))
})

protocolsRouter.post('/:id/versions', requireRole('admin', 'lab_technician'), async (req, res) => {
  const parsed = newVersionSchema.safeParse(req.body)
  if (!parsed.success) throw new AppError(400, 'NEVAŽEĆI_ZAHTJEV', parsed.error.errors[0].message)
  const version = await service.addVersion(String(req.params.id), parsed.data, req.user!.id, req.ip)
  res.status(201).json({ version })
})

// ─── Experiments ─────────────────────────────────────────────────────────────

experimentsRouter.get('/', async (req, res) => {
  const parsed = listExperimentsSchema.safeParse(req.query)
  if (!parsed.success) throw new AppError(400, 'NEVAŽEĆI_ZAHTJEV', parsed.error.errors[0].message)
  res.json(await service.listExperiments(parsed.data))
})

experimentsRouter.post('/', requireRole('admin', 'lab_technician'), async (req, res) => {
  const parsed = createExperimentSchema.safeParse(req.body)
  if (!parsed.success) throw new AppError(400, 'NEVAŽEĆI_ZAHTJEV', parsed.error.errors[0].message)
  const experiment = await service.createExperiment(parsed.data, req.user!.id)
  res.status(201).json({ experiment })
})

experimentsRouter.patch('/:id/complete', requireRole('admin', 'lab_technician'), async (req, res) => {
  const parsed = completeExperimentSchema.safeParse(req.body)
  if (!parsed.success) throw new AppError(400, 'NEVAŽEĆI_ZAHTJEV', parsed.error.errors[0].message)
  const experiment = await service.completeExperiment(String(req.params.id), parsed.data, req.user!.id)
  res.json({ experiment })
})

experimentsRouter.patch('/:id/cancel', requireRole('admin', 'lab_technician'), async (req, res) => {
  const experiment = await service.cancelExperiment(String(req.params.id), req.user!.id)
  res.json({ experiment })
})
