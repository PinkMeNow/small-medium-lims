import { z } from 'zod'

const CAS_REGEX = /^\d{2,7}-\d{2}-\d$/
const GHS_VALUES = ['GHS01', 'GHS02', 'GHS03', 'GHS04', 'GHS05', 'GHS06', 'GHS07', 'GHS08', 'GHS09'] as const
const UNIT_VALUES = ['g', 'mg', 'kg', 'mL', 'L', 'µL', 'mol', 'mmol', 'kom'] as const

export const createChemicalSchema = z.object({
  name: z.string().min(1, 'Naziv je obavezan.').max(255),
  casNumber: z
    .string()
    .regex(CAS_REGEX, 'Format CAS broja: XXXXXXX-YY-Z')
    .optional()
    .or(z.literal(''))
    .transform((v) => v || undefined),
  manufacturer: z.string().max(255).optional().or(z.literal('')).transform((v) => v || undefined),
  batchNumber: z.string().max(100).optional().or(z.literal('')).transform((v) => v || undefined),
  purchaseDate: z.string().min(1, 'Datum nabave je obavezan.'),
  expiryDate: z.string().min(1, 'Rok trajanja je obavezan.'),
  quantity: z.coerce.number().positive('Količina mora biti pozitivna.'),
  unit: z.enum(UNIT_VALUES, { required_error: 'Jedinica je obavezna.' }),
  minQuantity: z.coerce.number().min(0).default(0),
  storageLocation: z.string().min(1, 'Lokacija je obavezna.').max(255),
  storageTempMin: z.coerce.number().int().optional().or(z.literal('')).transform((v) => v === '' ? undefined : v as number | undefined),
  storageTempMax: z.coerce.number().int().optional().or(z.literal('')).transform((v) => v === '' ? undefined : v as number | undefined),
  ghsClasses: z.array(z.enum(GHS_VALUES)).default([]),
  sdsUrl: z
    .string()
    .url('Nevažeći URL.')
    .optional()
    .or(z.literal(''))
    .transform((v) => v || undefined),
  notes: z.string().max(2000).optional(),
})

export const updateChemicalSchema = createChemicalSchema.partial()

export const listChemicalsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  alert: z.enum(['expired', 'expiring_soon', 'low_stock']).optional(),
})

export type CreateChemicalInput = z.infer<typeof createChemicalSchema>
export type UpdateChemicalInput = z.infer<typeof updateChemicalSchema>
export type ListChemicalsInput = z.infer<typeof listChemicalsSchema>
