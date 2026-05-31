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
    <Chip color={COLOR[status]} variant="soft" className="text-xs px-2.5 py-0.5">
      {CHEMICAL_STATUS_LABELS[status]}
    </Chip>
  )
}
