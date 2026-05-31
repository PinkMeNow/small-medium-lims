import { api } from './client'
import type { Protocol, ProtocolVersion, Experiment, ProtocolsPage, ExperimentsPage, ProtocolStep } from '../types/protocols'

export interface ListProtocolsParams {
  page?: number
  limit?: number
  search?: string
  category?: string
}

export interface ListExperimentsParams {
  page?: number
  limit?: number
  protocolId?: string
  status?: string
}

export interface CreateProtocolInput {
  name: string
  description?: string
  category?: string
  steps: ProtocolStep[]
  requiredMaterials?: string[]
  requiredEquipment?: string[]
  expectedResults?: string
  notes?: string
}

export const getProtocols = (params: ListProtocolsParams) =>
  api.get<ProtocolsPage>('/protocols', { params }).then((r) => r.data)

export const getProtocol = (id: string) =>
  api.get<{ protocol: Protocol; versions: ProtocolVersion[]; experiments: Experiment[] }>(`/protocols/${id}`).then((r) => r.data)

export const createProtocol = (body: CreateProtocolInput) =>
  api.post<{ protocol: Protocol }>('/protocols', body).then((r) => r.data)

export const addProtocolVersion = (id: string, body: Omit<CreateProtocolInput, 'name' | 'description' | 'category'>) =>
  api.post<{ version: ProtocolVersion }>(`/protocols/${id}/versions`, body).then((r) => r.data)

export const getExperiments = (params: ListExperimentsParams) =>
  api.get<ExperimentsPage>('/experiments', { params }).then((r) => r.data)

export const createExperiment = (body: { protocolId: string; title: string; notes?: string }) =>
  api.post<{ experiment: Experiment }>('/experiments', body).then((r) => r.data)

export const completeExperiment = (id: string, body: { results: string; notes?: string }) =>
  api.patch<{ experiment: Experiment }>(`/experiments/${id}/complete`, body).then((r) => r.data)

export const cancelExperiment = (id: string) =>
  api.patch<{ experiment: Experiment }>(`/experiments/${id}/cancel`).then((r) => r.data)
