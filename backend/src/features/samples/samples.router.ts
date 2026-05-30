import { Router } from 'express'
import { requireAuth, requireRole } from '../../middleware/auth'
import { AppError } from '../../middleware/error'
import {
  createSampleSchema,
  updateStatusSchema,
  addNoteSchema,
  listSamplesSchema,
} from './samples.schema'
import * as service from './samples.service'

export const samplesRouter = Router()

samplesRouter.use(requireAuth)

samplesRouter.get('/', async (req, res) => {
  const parsed = listSamplesSchema.safeParse(req.query)
  if (!parsed.success) throw new AppError(400, 'NEVAŽEĆI_ZAHTJEV', parsed.error.errors[0].message)
  const result = await service.list(parsed.data, req.user!.id)
  res.json(result)
})

samplesRouter.post('/', requireRole('admin', 'lab_technician'), async (req, res) => {
  const parsed = createSampleSchema.safeParse(req.body)
  if (!parsed.success) throw new AppError(400, 'NEVAŽEĆI_ZAHTJEV', parsed.error.errors[0].message)
  const sample = await service.create(parsed.data, req.user!.id, req.ip)
  res.status(201).json({ sample })
})

samplesRouter.get('/:id', async (req, res) => {
  const result = await service.getById(String(req.params.id))
  res.json(result)
})

samplesRouter.patch('/:id/status', requireRole('admin', 'lab_technician'), async (req, res) => {
  const parsed = updateStatusSchema.safeParse(req.body)
  if (!parsed.success) throw new AppError(400, 'NEVAŽEĆI_ZAHTJEV', parsed.error.errors[0].message)
  const sample = await service.updateStatus(String(req.params.id), parsed.data, req.user!.id, req.ip)
  res.json({ sample })
})

samplesRouter.post('/:id/biljeska', requireRole('admin', 'lab_technician'), async (req, res) => {
  const parsed = addNoteSchema.safeParse(req.body)
  if (!parsed.success) throw new AppError(400, 'NEVAŽEĆI_ZAHTJEV', parsed.error.errors[0].message)
  const event = await service.addNote(String(req.params.id), parsed.data.notes, req.user!.id)
  res.status(201).json({ event })
})

samplesRouter.delete('/:id', requireRole('admin'), async (req, res) => {
  await service.softDelete(String(req.params.id), req.user!.id, req.ip)
  res.json({ poruka: 'Uzorak je obrisan.' })
})
