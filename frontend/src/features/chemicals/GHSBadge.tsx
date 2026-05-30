import type { GHSClass } from '../../types/chemicals'
import { GHS_INFO } from '../../types/chemicals'

const GHS_COLORS: Record<GHSClass, string> = {
  GHS01: 'bg-danger-soft text-danger',
  GHS02: 'bg-warning-soft text-warning-soft-foreground',
  GHS03: 'bg-warning-soft text-warning-soft-foreground',
  GHS04: 'bg-accent-soft text-accent',
  GHS05: 'bg-danger-soft text-danger',
  GHS06: 'bg-danger-soft text-danger',
  GHS07: 'bg-warning-soft text-warning-soft-foreground',
  GHS08: 'bg-danger-soft text-danger',
  GHS09: 'bg-success-soft text-success-soft-foreground',
}

interface Props {
  code: GHSClass
  showLabel?: boolean
}

export default function GHSBadge({ code, showLabel = false }: Props) {
  const info = GHS_INFO[code]
  return (
    <span
      title={info.label}
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-medium ${GHS_COLORS[code]}`}
    >
      {showLabel ? info.label : info.short}
    </span>
  )
}
