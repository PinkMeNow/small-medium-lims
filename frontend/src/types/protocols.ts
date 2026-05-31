export interface ProtocolStep {
  stepNumber: number
  title: string
  description: string
}

export type ExperimentStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled'

export interface ProtocolUser {
  id: string
  firstName: string
  lastName: string
}

export interface ProtocolVersion {
  id: string
  protocolId: string
  version: string
  steps: ProtocolStep[]
  requiredMaterials: string[]
  requiredEquipment: string[]
  expectedResults?: string
  notes?: string
  createdAt: string
}

export interface Protocol {
  id: string
  name: string
  description?: string
  category?: string
  currentVersion: string
  isActive: boolean
  createdBy: ProtocolUser
  createdAt: string
  updatedAt: string
  currentVersionData?: ProtocolVersion
  experimentCount?: number
}

export interface Experiment {
  id: string
  protocolId: string
  protocolVersionId: string
  title: string
  status: ExperimentStatus
  operator: ProtocolUser
  startedAt: string
  completedAt?: string
  results?: string
  notes?: string
  createdAt: string
  protocolName?: string
  protocolVersion?: string
}

export interface ProtocolsPage {
  data: Protocol[]
  meta: { page: number; limit: number; total: number }
}

export interface ExperimentsPage {
  data: Experiment[]
  meta: { page: number; limit: number; total: number }
}

export const EXPERIMENT_STATUS_LABELS: Record<ExperimentStatus, string> = {
  planned: 'Planiran',
  in_progress: 'U tijeku',
  completed: 'Završen',
  cancelled: 'Otkazan',
}

export const PROTOCOL_CATEGORIES = [
  'Analiza vode',
  'Analiza tla',
  'Analiza hrane',
  'Kemijska analiza',
  'Mikrobiološka analiza',
  'Fizikalna analiza',
  'Kalibracija',
  'Čišćenje i dezinfekcija',
  'Ostalo',
]
