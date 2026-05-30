import { api } from './client'
import type { AuthUser, LoginInput } from '../types/auth'

interface AuthResponse {
  accessToken: string
  user: AuthUser
}

export async function login(input: LoginInput) {
  const { data } = await api.post<AuthResponse>('/auth/login', input)
  return data
}

export async function logout() {
  await api.post('/auth/logout')
}

export async function refreshSession() {
  const { data } = await api.post<AuthResponse>('/auth/refresh')
  return data
}
