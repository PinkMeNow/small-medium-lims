import { Chip } from '@heroui/react'
import type { SampleStatus } from '../../types/samples'
import { SAMPLE_STATUS_LABELS } from '../../types/samples'

const COLOR: Record<SampleStatus, 'default' | 'primary' | 'warning' | 'success' | 'danger'> = {
  received: 'primary',
  processing: 'warning',
  analysed: 'success',
  archived: 'default',
  destroyed: 'danger',
}

interface Props {
  status: SampleStatus
}

export default function SampleStatusBadge({ status }: Props) {
  return (
    <Chip color={COLOR[status]} size="sm" variant="soft">
      {SAMPLE_STATUS_LABELS[status]}
    </Chip>
  )
}
