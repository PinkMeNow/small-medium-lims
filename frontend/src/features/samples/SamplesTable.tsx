import { useState } from 'react'
import {
  Button, Spinner,
  Select, SelectTrigger, SelectValue, SelectIndicator, SelectPopover,
  ListBox, ListBoxItem,
  SearchField, SearchFieldGroup, SearchFieldSearchIcon, SearchFieldInput, SearchFieldClearButton,
} from '@heroui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSamples, useUpdateSampleStatus } from './hooks'
import SampleStatusBadge from './SampleStatusBadge'
import { SAMPLE_STATUS_LABELS, ALLOWED_TRANSITIONS } from '../../types/samples'
import type { Sample, SampleStatus } from '../../types/samples'
import { format } from 'date-fns'
import { hr } from 'date-fns/locale'

const STATUS_OPTIONS = [
  { id: 'all', label: 'Svi statusi' },
  ...Object.entries(SAMPLE_STATUS_LABELS).map(([value, label]) => ({ id: value, label })),
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

  function handleSearch() {
    setSearch(searchInput)
    setPage(1)
  }

  async function handleStatusChange(sample: Sample, newStatus: SampleStatus) {
    await updateStatus.mutateAsync({ id: sample.id, status: newStatus })
  }

  const total = data?.meta.total ?? 0
  const totalPages = Math.ceil(total / 20)

  const COLUMNS = ['Kod', 'Vrsta', 'Izvor', 'Status', 'Zaprimio/la', 'Zaprimljeno', 'Akcija']

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-1">
          <SearchField
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={handleSearch}
            className="flex-1"
          >
            <SearchFieldGroup>
              <SearchFieldSearchIcon />
              <SearchFieldInput placeholder="Pretraži po kodu, izvoru, vrsti..." />
              <SearchFieldClearButton />
            </SearchFieldGroup>
          </SearchField>
          <Button variant="outline" size="sm" onClick={handleSearch}>Traži</Button>
        </div>

        <Select
          selectedKey={status || 'all'}
          onSelectionChange={(key) => { setStatus(key === 'all' ? '' : String(key)); setPage(1) }}
        >
          <SelectTrigger className="min-w-36">
            <SelectValue />
            <SelectIndicator />
          </SelectTrigger>
          <SelectPopover>
            <ListBox>
              {STATUS_OPTIONS.map((o) => (
                <ListBoxItem key={o.id} id={o.id}>{o.label}</ListBoxItem>
              ))}
            </ListBox>
          </SelectPopover>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
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
                {COLUMNS.map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider whitespace-nowrap">{col}</th>
                ))}
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
                    <td className="px-4 py-3"><SampleStatusBadge status={sample.status} /></td>
                    <td className="px-4 py-3 text-muted">
                      {sample.receivedBy.firstName} {sample.receivedBy.lastName}
                    </td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">
                      {format(new Date(sample.receivedAt), 'd. MMM yyyy.', { locale: hr })}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {nextStatuses.length > 0 && (
                        <Select
                          selectedKey={null}
                          onSelectionChange={(key) => { if (key) handleStatusChange(sample, String(key) as SampleStatus) }}
                        >
                          <SelectTrigger className="text-xs min-w-28">
                            <SelectValue placeholder="Promijeni →" />
                            <SelectIndicator />
                          </SelectTrigger>
                          <SelectPopover>
                            <ListBox>
                              {nextStatuses.map((s) => (
                                <ListBoxItem key={s} id={s}>{SAMPLE_STATUS_LABELS[s]}</ListBoxItem>
                              ))}
                            </ListBox>
                          </SelectPopover>
                        </Select>
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
            <Button variant="outline" size="sm" isIconOnly isDisabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm text-muted">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" isIconOnly isDisabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
