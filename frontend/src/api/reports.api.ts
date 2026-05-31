import { api } from './client'

export interface SamplesReportParams {
  from?: string
  to?: string
  status?: string
}

export interface ExperimentsReportParams {
  from?: string
  to?: string
  protocolId?: string
}

export const getSamplesReport = (params: SamplesReportParams) =>
  api.get<any>('/reports/samples', { params }).then((r) => r.data)

export const getChemicalsReport = () =>
  api.get<any>('/reports/chemicals').then((r) => r.data)

export const getExperimentsReport = (params: ExperimentsReportParams) =>
  api.get<any>('/reports/experiments', { params }).then((r) => r.data)

export const getChainOfCustody = (sampleId: string) =>
  api.get<any>(`/reports/chain-of-custody/${sampleId}`).then((r) => r.data)
