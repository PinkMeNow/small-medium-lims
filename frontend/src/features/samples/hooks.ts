import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../../api/samples.api'

export const SAMPLES_KEY = 'samples'

export function useSamples(params: api.ListSamplesParams) {
  return useQuery({
    queryKey: [SAMPLES_KEY, params],
    queryFn: () => api.getSamples(params),
    placeholderData: (prev) => prev,
  })
}

export function useCreateSample() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createSample,
    onSuccess: () => qc.invalidateQueries({ queryKey: [SAMPLES_KEY] }),
  })
}

export function useUpdateSampleStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      api.updateSampleStatus(id, status, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SAMPLES_KEY] }),
  })
}
