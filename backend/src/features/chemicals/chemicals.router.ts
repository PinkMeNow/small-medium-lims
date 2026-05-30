import { Router } from 'express'
import { requireAuth, requireRole } from '../../middleware/auth'
import { AppError } from '../../middleware/error'
import { createChemicalSchema, updateChemicalSchema, listChemicalsSchema } from './chemicals.schema'
import * as service from './chemicals.service'

export const chemicalsRouter = Router()

chemicalsRouter.use(requireAuth)

chemicalsRouter.get('/', async (req, res) => {
  const parsed = listChemicalsSchema.safeParse(req.query)
  if (!parsed.success) throw new AppError(400, 'NEVAŽEĆI_ZAHTJEV', parsed.error.errors[0].message)
  const result = await service.list(parsed.data)
  res.json(result)
})

chemicalsRouter.get('/alerts', async (_req, res) => {
  const result = await service.getAlerts()
  res.json(result)
})

chemicalsRouter.post('/', requireRole('admin', 'lab_technician'), async (req, res) => {
  const parsed = createChemicalSchema.safeParse(req.body)
  if (!parsed.success) throw new AppError(400, 'NEVAŽEĆI_ZAHTJEV', parsed.error.errors[0].message)
  const chemical = await service.create(parsed.data, req.user!.id, req.ip)
  res.status(201).json({ chemical })
})

chemicalsRouter.get('/:id', async (req, res) => {
  const result = await service.getById(String(req.params.id))
  res.json(result)
})

chemicalsRouter.patch('/:id', requireRole('admin', 'lab_technician'), async (req, res) => {
  const parsed = updateChemicalSchema.safeParse(req.body)
  if (!parsed.success) throw new AppError(400, 'NEVAŽEĆI_ZAHTJEV', parsed.error.errors[0].message)
  const chemical = await service.update(String(req.params.id), parsed.data, req.user!.id, req.ip)
  res.json({ chemical })
})

chemicalsRouter.delete('/:id', requireRole('admin'), async (req, res) => {
  await service.softDelete(String(req.params.id), req.user!.id, req.ip)
  res.json({ poruka: 'Kemikalija je obrisana.' })
})
