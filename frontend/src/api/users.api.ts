import { api } from './client'
import type { AppUser, UserRole } from '../types/users'

export const getUsers = () =>
  api.get<AppUser[]>('/users').then(r => r.data)

export const createUser = (body: { firstName: string; lastName: string; email: string; password: string; role: UserRole }) =>
  api.post<{ user: AppUser }>('/users', body).then(r => r.data)

export const updateUser = (id: string, body: Partial<{ firstName: string; lastName: string; email: string; password: string; role: UserRole; isActive: boolean }>) =>
  api.patch<{ user: AppUser }>(`/users/${id}`, body).then(r => r.data)

export const toggleUserActive = (id: string) =>
  api.patch<{ user: AppUser }>(`/users/${id}/toggle-active`).then(r => r.data)
