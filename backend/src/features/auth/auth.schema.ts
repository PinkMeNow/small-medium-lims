import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Unesite valjanu email adresu.'),
  password: z.string().min(1, 'Lozinka je obavezna.'),
})

export type LoginInput = z.infer<typeof loginSchema>
