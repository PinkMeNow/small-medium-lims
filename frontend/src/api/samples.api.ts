import { api } from './client'
import type { Sample, SampleDetail, SamplesPage, SampleEvent } from '../types/samples'

export interface ListSamplesParams {
  page?: number
  limit?: number
  search?: string
  status?: string
}

export const getSamples = (params: ListSamplesParams) =>
  api.get<SamplesPage>('/samples', { params }).then((r) => r.data)

export const getSample = (id: string) =>
  api.get<SampleDetail>(`/samples/${id}`).then((r) => r.data)

export const createSample = (body: { type: string; source: string; notes?: string }) =>
  api.post<{ sample: Sample }>('/samples', body).then((r) => r.data)

export const updateSampleStatus = (id: string, status: string, notes?: string) =>
  api.patch<{ sample: Sample }>(`/samples/${id}/status`, { status, notes }).then((r) => r.data)

export const addSampleNote = (id: string, notes: string) =>
  api.post<{ event: SampleEvent }>(`/samples/${id}/biljeska`, { notes }).then((r) => r.data)
