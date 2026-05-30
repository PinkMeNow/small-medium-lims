import { Chip } from '@heroui/react'
import type { ChemicalStatus } from '../../types/chemicals'
import { CHEMICAL_STATUS_LABELS } from '../../types/chemicals'

const COLOR: Record<ChemicalStatus, 'danger' | 'warning' | 'success' | 'default'> = {
  expired: 'danger',
  expiring_soon: 'warning',
  low_stock: 'warning',
  ok: 'success',
}

export default function ChemicalStatusBadge({ status }: { status: ChemicalStatus }) {
  return (
    <Chip color={COLOR[status]} size="sm" variant="soft">
      {CHEMICAL_STATUS_LABELS[status]}
    </Chip>
  )
}
