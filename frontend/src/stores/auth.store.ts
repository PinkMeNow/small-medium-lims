import { create } from 'zustand'
import type { AuthUser } from '../types/auth'

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isInitialising: boolean
  setAuth: (user: AuthUser, token: string) => void
  clearAuth: () => void
  setInitialised: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isInitialising: true,
  setAuth: (user, accessToken) => set({ user, accessToken, isInitialising: false }),
  clearAuth: () => set({ user: null, accessToken: null, isInitialising: false }),
  setInitialised: () => set({ isInitialising: false }),
}))
