import { useState, useMemo } from 'react'
import {
  Button, Spinner, Separator,
  Select, SelectTrigger, SelectValue, SelectIndicator, SelectPopover,
  ListBox, ListBoxItem,
  SearchField, SearchFieldGroup, SearchFieldSearchIcon, SearchFieldInput, SearchFieldClearButton,
  TableRoot, TableContent, TableHeader, TableBody, TableRow, TableColumn, TableCell,
  ModalRoot, ModalBackdrop, ModalContainer, ModalDialog,
  ModalHeader, ModalHeading, ModalBody, ModalFooter,
  useOverlayState,
} from '@heroui/react'
import { ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { useSamples, useUpdateSampleStatus } from './hooks'
import SampleStatusBadge from './SampleStatusBadge'
import { SAMPLE_STATUS_LABELS, ALLOWED_TRANSITIONS } from '../../types/samples'
import type { Sample, SampleStatus } from '../../types/samples'
import { format } from 'date-fns'
import { hr } from 'date-fns/locale'

interface SortDescriptor { column: string; direction: 'ascending' | 'descending' }
type SelectionSet = Set<string>

const STATUS_OPTIONS = [
  { id: 'all', label: 'Svi statusi' },
  ...Object.entries(SAMPLE_STATUS_LABELS).map(([value, label]) => ({ id: value, label })),
]

interface Props { onRowClick?: (sample: Sample) => void }

interface PendingChange { sample: Sample; newStatus: SampleStatus }

export default function SamplesTable({ onRowClick }: Props) {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({ column: 'receivedAt', direction: 'descending' })
  const [selectedKeys, setSelectedKeys] = useState<SelectionSet | 'all'>(new Set())
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null)
  const confirmModal = useOverlayState()

  const { data, isLoading, isError } = useSamples({ page, limit: 20, search, status: status || undefined })
  const updateStatus = useUpdateSampleStatus()

  const sortedData = useMemo(() => {
    if (!data?.data) return []
    return [...data.data].sort((a, b) => {
      const key = sortDescriptor.column as keyof Sample
      const av = String((a as any)[key] ?? '')
      const bv = String((b as any)[key] ?? '')
      const cmp = av.localeCompare(bv, 'hr')
      return sortDescriptor.direction === 'ascending' ? cmp : -cmp
    })
  }, [data?.data, sortDescriptor])

  const selectionCount = selectedKeys === 'all' ? sortedData.length : (selectedKeys as SelectionSet).size
  const selectedSamples = selectedKeys === 'all'
    ? sortedData
    : sortedData.filter(s => (selectedKeys as SelectionSet).has(s.id))

  async function bulkUpdateStatus(newStatus: SampleStatus) {
    const eligible = selectedSamples.filter(s => ALLOWED_TRANSITIONS[s.status].includes(newStatus))
    await Promise.all(eligible.map(s => updateStatus.mutateAsync({ id: s.id, status: newStatus })))
    setSelectedKeys(new Set())
  }

  function requestStatusChange(sample: Sample, newStatus: SampleStatus) {
    setPendingChange({ sample, newStatus })
    confirmModal.open()
  }

  async function confirmStatusChange() {
    if (!pendingChange) return
    await updateStatus.mutateAsync({ id: pendingChange.sample.id, status: pendingChange.newStatus })
    confirmModal.close()
    setPendingChange(null)
  }

  function cancelStatusChange() {
    confirmModal.close()
    setPendingChange(null)
  }

  const total = data?.meta.total ?? 0
  const totalPages = Math.ceil(total / 20)

  return (
    <div className="flex flex-col gap-4">
      {/* Bulk action bar */}
      {selectionCount > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-soft border border-accent/20 flex-wrap">
          <span className="text-sm font-medium text-accent">{selectionCount} uzoraka odabrano</span>
          <Separator orientation="vertical" className="h-4" />
          <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus('processing')}>→ U obradi</Button>
          <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus('analysed')}>→ Analiziran</Button>
          <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus('archived')}>→ Arhiviran</Button>
          <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setSelectedKeys(new Set())}>
            Poništi odabir
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-1">
          <SearchField value={searchInput} onChange={setSearchInput} onSubmit={() => { setSearch(searchInput); setPage(1) }} className="flex-1">
            <SearchFieldGroup>
              <SearchFieldSearchIcon />
              <SearchFieldInput placeholder="Pretraži po kodu, izvoru, vrsti..." />
              <SearchFieldClearButton />
            </SearchFieldGroup>
          </SearchField>
          <Button variant="outline" size="sm" onClick={() => { setSearch(searchInput); setPage(1) }}>Traži</Button>
        </div>
        <Select selectedKey={status || 'all'} onSelectionChange={(key) => { setStatus(key === 'all' ? '' : String(key)); setPage(1) }}>
          <SelectTrigger className="min-w-36"><SelectValue /><SelectIndicator /></SelectTrigger>
          <SelectPopover>
            <ListBox>{STATUS_OPTIONS.map(o => <ListBoxItem key={o.id} id={o.id}>{o.label}</ListBoxItem>)}</ListBox>
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
        ) : sortedData.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted">Nema uzoraka koji odgovaraju pretrazi.</p>
          </div>
        ) : (
          <TableRoot className="w-full min-w-[800px]">
            <TableContent
              aria-label="Lista uzoraka"
              selectionMode="multiple"
              selectedKeys={selectedKeys as any}
              onSelectionChange={(keys: any) => setSelectedKeys(keys)}
              sortDescriptor={sortDescriptor as any}
              onSortChange={(d: any) => setSortDescriptor({ column: String(d.column), direction: d.direction })}
            >
              <TableHeader>
                <TableColumn id="code" allowsSorting className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Kod</TableColumn>
                <TableColumn id="type" allowsSorting className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Vrsta</TableColumn>
                <TableColumn id="source" className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Izvor</TableColumn>
                <TableColumn id="status" className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Status</TableColumn>
                <TableColumn id="receivedBy" className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Zaprimio/la</TableColumn>
                <TableColumn id="receivedAt" allowsSorting className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Zaprimljeno</TableColumn>
                <TableColumn id="detail" className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider"></TableColumn>
                <TableColumn id="actions" className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Akcija</TableColumn>
              </TableHeader>
              <TableBody>
                {sortedData.map((sample) => {
                  const nextStatuses = ALLOWED_TRANSITIONS[sample.status]
                  return (
                    <TableRow key={sample.id} id={sample.id}>
                      <TableCell className="px-4 py-3 font-mono font-medium text-foreground">{sample.code}</TableCell>
                      <TableCell className="px-4 py-3 text-foreground">{sample.type}</TableCell>
                      <TableCell className="px-4 py-3 text-muted max-w-48 truncate">{sample.source}</TableCell>
                      <TableCell className="px-4 py-3"><SampleStatusBadge status={sample.status} /></TableCell>
                      <TableCell className="px-4 py-3 text-muted text-sm">
                        {sample.receivedBy.firstName} {sample.receivedBy.lastName}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted whitespace-nowrap text-sm">
                        {format(new Date(sample.receivedAt), 'd. MMM yyyy.', { locale: hr })}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Button variant="ghost" size="sm" isIconOnly title="Detalji" onClick={() => onRowClick?.(sample)}>
                          <Info size={16} className="text-muted" />
                        </Button>
                      </TableCell>
                      <TableCell className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        {nextStatuses.length > 0 && (
                          <Select
                            selectedKey={null}
                            placeholder="Promijeni →"
                            onSelectionChange={(key) => { if (key) requestStatusChange(sample, String(key) as SampleStatus) }}
                          >
                            <SelectTrigger className="text-xs min-w-28"><SelectValue /><SelectIndicator /></SelectTrigger>
                            <SelectPopover>
                              <ListBox>
                                {nextStatuses.map(s => <ListBoxItem key={s} id={s}>{SAMPLE_STATUS_LABELS[s]}</ListBoxItem>)}
                              </ListBox>
                            </SelectPopover>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </TableContent>
          </TableRoot>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">Ukupno: <span className="text-foreground font-medium">{total}</span> uzoraka</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" isIconOnly isDisabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></Button>
            <span className="text-sm text-muted">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" isIconOnly isDisabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></Button>
          </div>
        </div>
      )}

      {/* Status change confirmation modal */}
      {pendingChange && (
        <ModalRoot state={confirmModal}>
          {confirmModal.isOpen && <ModalBackdrop />}
          <ModalContainer size="sm" className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <ModalDialog>
              <ModalHeader>
                <ModalHeading>Potvrdi promjenu statusa</ModalHeading>
              </ModalHeader>
              <ModalBody className="py-4">
                <p className="text-sm text-foreground">
                  Promijeniti status uzorka{' '}
                  <span className="font-mono font-semibold">{pendingChange.sample.code}</span>{' '}
                  u <span className="font-medium">{SAMPLE_STATUS_LABELS[pendingChange.newStatus]}</span>?
                </p>
                <p className="text-xs text-muted mt-1">Ova akcija bit će zabilježena u historiji uzorka.</p>
              </ModalBody>
              <ModalFooter className="gap-2">
                <Button variant="outline" onClick={cancelStatusChange} isDisabled={updateStatus.isPending}>
                  Odustani
                </Button>
                <Button variant="primary" onClick={confirmStatusChange} isDisabled={updateStatus.isPending}>
                  {updateStatus.isPending ? <Spinner size="sm" /> : 'Potvrdi'}
                </Button>
              </ModalFooter>
            </ModalDialog>
          </ModalContainer>
        </ModalRoot>
      )}
    </div>
  )
}
