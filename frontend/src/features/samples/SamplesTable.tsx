import { useState } from 'react'
import { Button, Spinner } from '@heroui/react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSamples, useUpdateSampleStatus } from './hooks'
import SampleStatusBadge from './SampleStatusBadge'
import { SAMPLE_STATUS_LABELS, ALLOWED_TRANSITIONS } from '../../types/samples'
import type { Sample, SampleStatus } from '../../types/samples'
import { format } from 'date-fns'
import { hr } from 'date-fns/locale'

const STATUS_OPTIONS = [
  { value: '', label: 'Svi statusi' },
  ...Object.entries(SAMPLE_STATUS_LABELS).map(([value, label]) => ({ value, label })),
]

interface Props {
  onRowClick?: (sample: Sample) => void
}

export default function SamplesTable({ onRowClick }: Props) {
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useSamples({ page, limit: 20, search, status: status || undefined })
  const updateStatus = useUpdateSampleStatus()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  function handleStatusFilter(val: string) {
    setStatus(val)
    setPage(1)
  }

  async function handleStatusChange(sample: Sample, newStatus: SampleStatus) {
    await updateStatus.mutateAsync({ id: sample.id, status: newStatus })
  }

  const total = data?.meta.total ?? 0
  const totalPages = Math.ceil(total / 20)

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Pretraži po kodu, izvoru, vrsti..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-field-background border border-field-border text-field-foreground text-sm placeholder:text-field-placeholder focus:outline-none focus:border-accent"
            />
          </div>
          <Button type="submit" variant="outline" size="sm">Traži</Button>
        </form>

        <select
          value={status}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-field-background border border-field-border text-field-foreground text-sm focus:outline-none focus:border-accent"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <div className="py-16 text-center">
            <p className="text-sm text-danger">Greška pri učitavanju uzoraka.</p>
            <p className="text-xs text-muted mt-1">Provjerite je li backend pokrenut.</p>
          </div>
        ) : data?.data.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted">Nema uzoraka koji odgovaraju pretrazi.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-secondary">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Kod</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Vrsta</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Izvor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Zaprimio/la</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Zaprimljeno</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Akcija</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-separator">
              {data?.data.map((sample) => {
                const nextStatuses = ALLOWED_TRANSITIONS[sample.status]
                return (
                  <tr
                    key={sample.id}
                    className="hover:bg-surface-secondary transition-colors cursor-pointer"
                    onClick={() => onRowClick?.(sample)}
                  >
                    <td className="px-4 py-3 font-mono font-medium text-foreground">{sample.code}</td>
                    <td className="px-4 py-3 text-foreground">{sample.type}</td>
                    <td className="px-4 py-3 text-muted max-w-48 truncate">{sample.source}</td>
                    <td className="px-4 py-3">
                      <SampleStatusBadge status={sample.status} />
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {sample.receivedBy.firstName} {sample.receivedBy.lastName}
                    </td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">
                      {format(new Date(sample.receivedAt), 'd. MMM yyyy.', { locale: hr })}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {nextStatuses.length > 0 && (
                        <select
                          className="text-xs px-2 py-1 rounded-lg bg-default border-0 text-foreground cursor-pointer focus:outline-none"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) handleStatusChange(sample, e.target.value as SampleStatus)
                            e.target.value = ''
                          }}
                        >
                          <option value="">Promijeni →</option>
                          {nextStatuses.map((s) => (
                            <option key={s} value={s}>{SAMPLE_STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            Ukupno: <span className="text-foreground font-medium">{total}</span> uzoraka
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              isIconOnly
              isDisabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm text-muted">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              isIconOnly
              isDisabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
