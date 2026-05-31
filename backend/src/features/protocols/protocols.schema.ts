import { z } from 'zod'

const stepSchema = z.object({
  stepNumber: z.number().int().positive(),
  title: z.string().min(1, 'Naslov koraka je obavezan.').max(255),
  description: z.string().min(1, 'Opis koraka je obavezan.').max(5000),
})

export const createProtocolSchema = z.object({
  name: z.string().min(1, 'Naziv protokola je obavezan.').max(255),
  description: z.string().max(2000).optional(),
  category: z.string().max(100).optional(),
  steps: z.array(stepSchema).min(1, 'Protokol mora imati barem jedan korak.'),
  requiredMaterials: z.array(z.string().max(255)).default([]),
  requiredEquipment: z.array(z.string().max(255)).default([]),
  expectedResults: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
})

export const newVersionSchema = z.object({
  steps: z.array(stepSchema).min(1, 'Protokol mora imati barem jedan korak.'),
  requiredMaterials: z.array(z.string().max(255)).default([]),
  requiredEquipment: z.array(z.string().max(255)).default([]),
  expectedResults: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
})

export const createExperimentSchema = z.object({
  protocolId: z.string().uuid(),
  title: z.string().min(1, 'Naslov je obavezan.').max(255),
  notes: z.string().max(2000).optional(),
})

export const completeExperimentSchema = z.object({
  results: z.string().min(1, 'Rezultati su obavezni za završetak eksperimenta.').max(5000),
  notes: z.string().max(2000).optional(),
})

export const listProtocolsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
})

export const listExperimentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  protocolId: z.string().uuid().optional(),
  status: z.enum(['planned', 'in_progress', 'completed', 'cancelled']).optional(),
})

export type CreateProtocolInput = z.infer<typeof createProtocolSchema>
export type NewVersionInput = z.infer<typeof newVersionSchema>
export type CreateExperimentInput = z.infer<typeof createExperimentSchema>
export type CompleteExperimentInput = z.infer<typeof completeExperimentSchema>
export type ListProtocolsInput = z.infer<typeof listProtocolsSchema>
export type ListExperimentsInput = z.infer<typeof listExperimentsSchema>
