import { z } from 'zod'

export const createUserSchema = z.object({
  firstName: z.string().min(1, 'Ime je obavezno.').max(100),
  lastName: z.string().min(1, 'Prezime je obavezno.').max(100),
  email: z.string().email('Unesite valjanu email adresu.'),
  password: z.string().min(8, 'Lozinka mora imati najmanje 8 znakova.'),
  role: z.enum(['admin', 'lab_technician', 'viewer']),
})

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'lab_technician', 'viewer']).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
