import { Chip } from '@heroui/react'
import type { ExperimentStatus } from '../../types/protocols'
import { EXPERIMENT_STATUS_LABELS } from '../../types/protocols'

const COLOR: Record<ExperimentStatus, 'default' | 'primary' | 'success' | 'danger'> = {
  planned: 'default',
  in_progress: 'primary',
  completed: 'success',
  cancelled: 'danger',
}

export default function ExperimentStatusBadge({ status }: { status: ExperimentStatus }) {
  return (
    <Chip color={COLOR[status]} size="sm" variant="soft">
      {EXPERIMENT_STATUS_LABELS[status]}
    </Chip>
  )
}
