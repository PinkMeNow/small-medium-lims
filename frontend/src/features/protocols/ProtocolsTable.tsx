import { useState, useMemo } from 'react'
import {
  Button, Spinner,
  SearchField, SearchFieldGroup, SearchFieldSearchIcon, SearchFieldInput, SearchFieldClearButton,
  TableRoot, TableContent, TableHeader, TableBody, TableRow, TableColumn, TableCell,
} from '@heroui/react'
import { ChevronLeft, ChevronRight, FlaskConical, Tag, Info } from 'lucide-react'
import { useProtocols } from './hooks'
import { format } from 'date-fns'
import { hr } from 'date-fns/locale'
import type { Protocol } from '../../types/protocols'

interface SortDescriptor { column: string; direction: 'ascending' | 'descending' }
interface Props {
  onRunExperiment?: (protocol: Protocol) => void
  onNewVersion?: (protocol: Protocol) => void
  onViewDetail?: (protocol: Protocol) => void
}

export default function ProtocolsTable({ onRunExperiment, onViewDetail, onNewVersion }: Props) {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({ column: 'createdAt', direction: 'descending' })

  const { data, isLoading, isError } = useProtocols({ page, limit: 20, search })

  const sortedData = useMemo(() => {
    if (!data?.data) return []
    return [...data.data].sort((a, b) => {
      const key = sortDescriptor.column as keyof Protocol
      const av = String((a as any)[key] ?? '')
      const bv = String((b as any)[key] ?? '')
      const cmp = av.localeCompare(bv, 'hr')
      return sortDescriptor.direction === 'ascending' ? cmp : -cmp
    })
  }, [data?.data, sortDescriptor])

  const total = data?.meta.total ?? 0
  const totalPages = Math.ceil(total / 20)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 max-w-md">
        <SearchField value={searchInput} onChange={setSearchInput} onSubmit={() => { setSearch(searchInput); setPage(1) }} className="flex-1">
          <SearchFieldGroup>
            <SearchFieldSearchIcon />
            <SearchFieldInput placeholder="Pretraži po nazivu ili kategoriji..." />
            <SearchFieldClearButton />
          </SearchFieldGroup>
        </SearchField>
        <Button variant="outline" size="sm" onClick={() => { setSearch(searchInput); setPage(1) }}>Traži</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface-secondary">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
        ) : isError ? (
          <div className="py-16 text-center">
            <p className="text-sm text-danger">Greška pri učitavanju protokola.</p>
            <p className="text-xs text-muted mt-1">Provjerite je li backend pokrenut.</p>
          </div>
        ) : sortedData.length === 0 ? (
          <div className="py-16 text-center"><p className="text-sm text-muted">Nema protokola. Dodajte prvi SOP.</p></div>
        ) : (
          <TableRoot className="w-full min-w-[820px]">
            <TableContent
              aria-label="Lista protokola"
              sortDescriptor={sortDescriptor as any}
              onSortChange={(d: any) => setSortDescriptor({ column: String(d.column), direction: d.direction })}
            >
              <TableHeader>
                <TableColumn id="name" allowsSorting className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Naziv</TableColumn>
                <TableColumn id="category" allowsSorting className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Kategorija</TableColumn>
                <TableColumn id="currentVersion" allowsSorting className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Verzija</TableColumn>
                <TableColumn id="steps" className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider text-center">Koraci</TableColumn>
                <TableColumn id="experimentCount" allowsSorting className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider text-center">Eksperimenti</TableColumn>
                <TableColumn id="createdBy" className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Kreirao/la</TableColumn>
                <TableColumn id="createdAt" allowsSorting className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Kreirano</TableColumn>
                <TableColumn id="detail" className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider"></TableColumn>
                <TableColumn id="actions" className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider"></TableColumn>
              </TableHeader>
              <TableBody>
                {sortedData.map((p) => (
                  <TableRow key={p.id} id={p.id}>
                    <TableCell className="px-4 py-3">
                      <div className="font-medium text-foreground">{p.name}</div>
                      {p.description && <div className="text-xs text-muted truncate max-w-64">{p.description}</div>}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {p.category ? (
                        <span className="inline-flex items-center gap-1 text-xs text-accent bg-accent-soft px-2 py-0.5 rounded-md">
                          <Tag size={10} /> {p.category}
                        </span>
                      ) : <span className="text-muted text-xs">—</span>}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="font-mono text-xs text-foreground bg-default px-2 py-0.5 rounded-md">v{p.currentVersion}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-muted text-center text-sm">—</TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs text-muted">
                        <FlaskConical size={12} /> {p.experimentCount ?? 0}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-muted text-xs">
                      {p.createdBy.firstName} {p.createdBy.lastName}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-muted text-xs whitespace-nowrap">
                      {format(new Date(p.createdAt), 'd. MMM yyyy.', { locale: hr })}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Button variant="ghost" size="sm" isIconOnly title="Pogledaj korake" onClick={() => onViewDetail?.(p)}>
                        <Info size={16} className="text-muted" />
                      </Button>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" onClick={() => onRunExperiment?.(p)}>Pokreni</Button>
                        <Button variant="ghost" size="sm" onClick={() => onNewVersion?.(p)} className="text-muted text-xs">Nova ver.</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableContent>
          </TableRoot>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">Ukupno: <span className="text-foreground font-medium">{total}</span> protokola</p>
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
