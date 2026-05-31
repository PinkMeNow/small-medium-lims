import { useState, useMemo } from 'react'
import {
  Button, Spinner, Separator,
  Select, SelectTrigger, SelectValue, SelectIndicator, SelectPopover,
  ListBox, ListBoxItem,
  SearchField, SearchFieldGroup, SearchFieldSearchIcon, SearchFieldInput, SearchFieldClearButton,
  TableRoot, TableContent, TableHeader, TableBody, TableRow, TableColumn, TableCell,
} from '@heroui/react'
import { ChevronLeft, ChevronRight, ExternalLink, Trash2, FlaskConical } from 'lucide-react'
import { useChemicals } from './hooks'
import GHSBadge from './GHSBadge'
import ChemicalStatusBadge from './ChemicalStatusBadge'
import { getChemicalStatus } from '../../types/chemicals'
import type { Chemical } from '../../types/chemicals'
import { useAuthStore } from '../../stores/auth.store'
import { format, differenceInDays } from 'date-fns'
import { hr } from 'date-fns/locale'

interface SortDescriptor { column: string; direction: 'ascending' | 'descending' }
type SelectionSet = Set<string>

const ALERT_OPTIONS = [
  { id: 'all', label: 'Svi' },
  { id: 'expired', label: 'Istekli' },
  { id: 'expiring_soon', label: 'Ističu uskoro' },
  { id: 'low_stock', label: 'Niske zalihe' },
]

interface Props { onUpdateQuantity?: (c: Chemical) => void }

export default function ChemicalsTable({ onUpdateQuantity }: Props) {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [alert, setAlert] = useState('')
  const [page, setPage] = useState(1)
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({ column: 'name', direction: 'ascending' })
  const [selectedKeys, setSelectedKeys] = useState<SelectionSet | 'all'>(new Set())

  const { data, isLoading, isError } = useChemicals({ page, limit: 20, search, alert: alert || undefined })
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'

  const sortedData = useMemo(() => {
    if (!data?.data) return []
    return [...data.data].sort((a, b) => {
      const key = sortDescriptor.column as keyof Chemical
      const av = String((a as any)[key] ?? '')
      const bv = String((b as any)[key] ?? '')
      const cmp = av.localeCompare(bv, 'hr')
      return sortDescriptor.direction === 'ascending' ? cmp : -cmp
    })
  }, [data?.data, sortDescriptor])

  const selectionCount = selectedKeys === 'all' ? sortedData.length : (selectedKeys as SelectionSet).size

  function clearSelection() { setSelectedKeys(new Set()) }

  const total = data?.meta.total ?? 0
  const totalPages = Math.ceil(total / 20)

  return (
    <div className="flex flex-col gap-4">
      {/* Bulk action bar */}
      {selectionCount > 0 && isAdmin && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-danger-soft border border-danger/20 flex-wrap">
          <span className="text-sm font-medium text-danger">{selectionCount} kemikalija odabrano</span>
          <Separator orientation="vertical" className="h-4" />
          <Button size="sm" variant="outline" color="danger">
            <Trash2 size={14} /> Obriši odabrane
          </Button>
          <Button size="sm" variant="ghost" className="ml-auto" onClick={clearSelection}>Poništi odabir</Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-1">
          <SearchField value={searchInput} onChange={setSearchInput} onSubmit={() => { setSearch(searchInput); setPage(1) }} className="flex-1">
            <SearchFieldGroup>
              <SearchFieldSearchIcon />
              <SearchFieldInput placeholder="Pretraži po nazivu, CAS broju, lokaciji..." />
              <SearchFieldClearButton />
            </SearchFieldGroup>
          </SearchField>
          <Button variant="outline" size="sm" onClick={() => { setSearch(searchInput); setPage(1) }}>Traži</Button>
        </div>
        <Select selectedKey={alert || 'all'} onSelectionChange={(key) => { setAlert(key === 'all' ? '' : String(key)); setPage(1) }}>
          <SelectTrigger className="min-w-36"><SelectValue /><SelectIndicator /></SelectTrigger>
          <SelectPopover>
            <ListBox>{ALERT_OPTIONS.map(o => <ListBoxItem key={o.id} id={o.id}>{o.label}</ListBoxItem>)}</ListBox>
          </SelectPopover>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
        ) : isError ? (
          <div className="py-16 text-center">
            <p className="text-sm text-danger">Greška pri učitavanju kemikalija.</p>
            <p className="text-xs text-muted mt-1">Provjerite je li backend pokrenut.</p>
          </div>
        ) : sortedData.length === 0 ? (
          <div className="py-16 text-center"><p className="text-sm text-muted">Nema kemikalija koje odgovaraju pretrazi.</p></div>
        ) : (
          <TableRoot className="w-full">
            <TableContent
              aria-label="Lista kemikalija"
              selectionMode={isAdmin ? 'multiple' : 'none'}
              selectedKeys={selectedKeys as any}
              onSelectionChange={(keys: any) => setSelectedKeys(keys)}
              sortDescriptor={sortDescriptor as any}
              onSortChange={(d: any) => setSortDescriptor({ column: String(d.column), direction: d.direction })}
            >
              <TableHeader>
                <TableColumn id="name" allowsSorting className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Naziv</TableColumn>
                <TableColumn id="casNumber" allowsSorting className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">CAS broj</TableColumn>
                <TableColumn id="quantity" allowsSorting className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Količina</TableColumn>
                <TableColumn id="storageLocation" allowsSorting className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Lokacija</TableColumn>
                <TableColumn id="expiryDate" allowsSorting className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Rok trajanja</TableColumn>
                <TableColumn id="ghsClasses" className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">GHS</TableColumn>
                <TableColumn id="status" className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Status</TableColumn>
                <TableColumn id="sds" className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider"></TableColumn>
              </TableHeader>
              <TableBody>
                {sortedData.map((c) => {
                  const status = getChemicalStatus(c)
                  const daysLeft = differenceInDays(new Date(c.expiryDate), new Date())
                  return (
                    <TableRow key={c.id} id={c.id}>
                      <TableCell className="px-4 py-3 font-medium text-foreground max-w-48">
                        <div className="truncate">{c.name}</div>
                        {c.manufacturer && <div className="text-xs text-muted truncate">{c.manufacturer}</div>}
                      </TableCell>
                      <TableCell className="px-4 py-3 font-mono text-muted text-xs">{c.casNumber ?? '—'}</TableCell>
                      <TableCell className="px-4 py-3 text-foreground whitespace-nowrap text-sm">
                        {c.quantity} {c.unit}
                        {Number(c.minQuantity) > 0 && <div className="text-xs text-muted">min. {c.minQuantity} {c.unit}</div>}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted max-w-32 text-sm">
                        <div className="truncate">{c.storageLocation}</div>
                        {(c.storageTempMin != null || c.storageTempMax != null) && (
                          <div className="text-xs text-muted">{c.storageTempMin ?? '?'}°C – {c.storageTempMax ?? '?'}°C</div>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 whitespace-nowrap">
                        <div className={status === 'expired' ? 'text-danger text-xs font-medium' : status === 'expiring_soon' ? 'text-warning text-xs font-medium' : 'text-muted text-xs'}>
                          {format(new Date(c.expiryDate), 'd. MMM yyyy.', { locale: hr })}
                        </div>
                        {daysLeft >= 0 && daysLeft <= 30 && <div className="text-xs text-warning">za {daysLeft} dana</div>}
                        {daysLeft < 0 && <div className="text-xs text-danger">prije {Math.abs(daysLeft)} dana</div>}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {c.ghsClasses.length > 0 ? c.ghsClasses.map(g => <GHSBadge key={g} code={g} />) : <span className="text-xs text-muted">—</span>}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3"><ChemicalStatusBadge status={status} /></TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost" size="sm" isIconOnly
                            title="Ažuriraj količinu"
                            onClick={() => onUpdateQuantity?.(c)}
                          >
                            <FlaskConical size={15} className="text-muted" />
                          </Button>
                          {c.sdsUrl && (
                            <a href={c.sdsUrl} target="_blank" rel="noreferrer" className="text-accent hover:text-accent-hover" title="Otvori SDS">
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </TableContent>
          </TableRoot>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">Ukupno: <span className="text-foreground font-medium">{total}</span> kemikalija</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" isIconOnly isDisabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></Button>
            <span className="text-sm text-muted">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" isIconOnly isDisabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></Button>
          </div>
        </div>
      )}
    </div>
  )
}
