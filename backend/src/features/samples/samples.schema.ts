import { z } from 'zod'

export const createSampleSchema = z.object({
  type: z.string().min(1, 'Vrsta uzorka je obavezna.').max(100),
  source: z.string().min(1, 'Izvor uzorka je obavezan.').max(255),
  notes: z.string().max(2000).optional(),
})

export const updateStatusSchema = z.object({
  status: z.enum(['processing', 'analysed', 'archived', 'destroyed']),
  notes: z.string().max(2000).optional(),
})

export const addNoteSchema = z.object({
  notes: z.string().min(1, 'Bilješka ne smije biti prazna.').max(2000),
})

export const listSamplesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['received', 'processing', 'analysed', 'archived', 'destroyed']).optional(),
})

export type CreateSampleInput = z.infer<typeof createSampleSchema>
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>
export type ListSamplesInput = z.infer<typeof listSamplesSchema>
