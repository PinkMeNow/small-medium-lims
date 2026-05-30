import { api } from './client'
import type { Chemical, ChemicalsPage } from '../types/chemicals'

export interface ListChemicalsParams {
  page?: number
  limit?: number
  search?: string
  alert?: string
}

export interface ChemicalInput {
  name: string
  casNumber?: string
  manufacturer?: string
  batchNumber?: string
  purchaseDate: string
  expiryDate: string
  quantity: number
  unit: string
  minQuantity?: number
  storageLocation: string
  storageTempMin?: number
  storageTempMax?: number
  ghsClasses?: string[]
  sdsUrl?: string
  notes?: string
}

export const getChemicals = (params: ListChemicalsParams) =>
  api.get<ChemicalsPage>('/chemicals', { params }).then((r) => r.data)

export const getChemical = (id: string) =>
  api.get<{ chemical: Chemical }>(`/chemicals/${id}`).then((r) => r.data)

export const createChemical = (body: ChemicalInput) =>
  api.post<{ chemical: Chemical }>('/chemicals', body).then((r) => r.data)

export const updateChemical = (id: string, body: Partial<ChemicalInput>) =>
  api.patch<{ chemical: Chemical }>(`/chemicals/${id}`, body).then((r) => r.data)

export const deleteChemical = (id: string) =>
  api.delete(`/chemicals/${id}`)
