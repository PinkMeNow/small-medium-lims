import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../../api/protocols.api'

export const PROTOCOLS_KEY = 'protocols'
export const EXPERIMENTS_KEY = 'experiments'

export function useProtocols(params: api.ListProtocolsParams) {
  return useQuery({
    queryKey: [PROTOCOLS_KEY, params],
    queryFn: () => api.getProtocols(params),
    placeholderData: (prev) => prev,
  })
}

export function useProtocol(id: string) {
  return useQuery({
    queryKey: [PROTOCOLS_KEY, id],
    queryFn: () => api.getProtocol(id),
    enabled: !!id,
  })
}

export function useCreateProtocol() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createProtocol,
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROTOCOLS_KEY] }),
  })
}

export function useExperiments(params: api.ListExperimentsParams) {
  return useQuery({
    queryKey: [EXPERIMENTS_KEY, params],
    queryFn: () => api.getExperiments(params),
    placeholderData: (prev) => prev,
  })
}

export function useCreateExperiment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createExperiment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EXPERIMENTS_KEY] })
      qc.invalidateQueries({ queryKey: [PROTOCOLS_KEY] })
    },
  })
}

export function useCompleteExperiment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, results, notes }: { id: string; results: string; notes?: string }) =>
      api.completeExperiment(id, { results, notes }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EXPERIMENTS_KEY] }),
  })
}
