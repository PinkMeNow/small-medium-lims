import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../../api/users.api'

export const USERS_KEY = 'users'

export function useUsers() {
  return useQuery({ queryKey: [USERS_KEY], queryFn: api.getUsers })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: api.createUser, onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }) })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof api.updateUser>[1] }) => api.updateUser(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  })
}

export function useToggleUserActive() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: api.toggleUserActive, onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }) })
}
