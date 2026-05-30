export type SampleStatus = 'received' | 'processing' | 'analysed' | 'archived' | 'destroyed'

export interface SampleUser {
  id: string
  firstName: string
  lastName: string
}

export interface Sample {
  id: string
  code: string
  type: string
  source: string
  status: SampleStatus
  notes?: string
  receivedBy: SampleUser
  receivedAt: string
  createdAt: string
  updatedAt: string
}

export interface SampleEvent {
  id: string
  sampleId: string
  user?: SampleUser
  eventType: string
  oldStatus?: SampleStatus
  newStatus?: SampleStatus
  notes?: string
  createdAt: string
}

export interface SampleDetail extends Sample {
  events: SampleEvent[]
}

export interface SamplesPage {
  data: Sample[]
  meta: { page: number; limit: number; total: number }
}

export const SAMPLE_STATUS_LABELS: Record<SampleStatus, string> = {
  received: 'Zaprimljen',
  processing: 'U obradi',
  analysed: 'Analiziran',
  archived: 'Arhiviran',
  destroyed: 'Uništen',
}

export const ALLOWED_TRANSITIONS: Record<SampleStatus, SampleStatus[]> = {
  received: ['processing'],
  processing: ['analysed'],
  analysed: ['archived', 'destroyed'],
  archived: [],
  destroyed: [],
}

export const SAMPLE_TYPES = [
  'Voda',
  'Tlo',
  'Hrana',
  'Zrak',
  'Biološki',
  'Kemijski',
  'Ostalo',
]
