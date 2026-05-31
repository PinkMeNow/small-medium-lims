import { api } from './client'

export interface DashboardStats {
  samplesInProgress: number
  samplesTotal: number
  chemicalsAlerts: number
  activeProtocols: number
  experimentsThisMonth: number
}

export interface ActivityEvent {
  id: string
  sampleId: string
  sampleCode: string
  sampleType: string
  eventType: string
  oldStatus?: string
  newStatus?: string
  notes?: string
  createdAt: string
  user: string
}

export const getDashboardStats = () =>
  api.get<DashboardStats>('/dashboard/stats').then(r => r.data)

export const getRecentActivity = () =>
  api.get<ActivityEvent[]>('/dashboard/activity').then(r => r.data)
