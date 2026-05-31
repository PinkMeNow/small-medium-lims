export type UserRole = 'admin' | 'lab_technician' | 'viewer'

export interface AppUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  lab_technician: 'Laborant',
  viewer: 'Promatrač',
}

export const ROLE_OPTIONS: { id: UserRole; label: string }[] = [
  { id: 'admin', label: 'Administrator' },
  { id: 'lab_technician', label: 'Laborant' },
  { id: 'viewer', label: 'Promatrač' },
]
