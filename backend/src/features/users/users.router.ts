import { Router } from 'express'
import { requireAuth, requireRole } from '../../middleware/auth'
import { AppError } from '../../middleware/error'
import { createUserSchema, updateUserSchema } from './users.schema'
import * as service from './users.service'

export const usersRouter = Router()

usersRouter.use(requireAuth, requireRole('admin'))

usersRouter.get('/', async (_req, res) => {
  res.json(await service.list())
})

usersRouter.post('/', async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body)
  if (!parsed.success) throw new AppError(400, 'NEVAŽEĆI_ZAHTJEV', parsed.error.errors[0].message)
  const user = await service.create(parsed.data, req.user!.id, req.ip)
  res.status(201).json({ user })
})

usersRouter.get('/:id', async (req, res) => {
  res.json(await service.getById(String(req.params.id)))
})

usersRouter.patch('/:id', async (req, res) => {
  const parsed = updateUserSchema.safeParse(req.body)
  if (!parsed.success) throw new AppError(400, 'NEVAŽEĆI_ZAHTJEV', parsed.error.errors[0].message)
  const user = await service.update(String(req.params.id), parsed.data, req.user!.id, req.ip)
  res.json({ user })
})

usersRouter.patch('/:id/toggle-active', async (req, res) => {
  const user = await service.toggleActive(String(req.params.id), req.user!.id, req.ip)
  res.json({ user })
})
