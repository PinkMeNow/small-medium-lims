import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../../api/chemicals.api'

export const CHEMICALS_KEY = 'chemicals'

export function useChemicals(params: api.ListChemicalsParams) {
  return useQuery({
    queryKey: [CHEMICALS_KEY, params],
    queryFn: () => api.getChemicals(params),
    placeholderData: (prev) => prev,
  })
}

export function useCreateChemical() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createChemical,
    onSuccess: () => qc.invalidateQueries({ queryKey: [CHEMICALS_KEY] }),
  })
}

export function useUpdateChemical() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<api.ChemicalInput> }) =>
      api.updateChemical(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CHEMICALS_KEY] }),
  })
}
