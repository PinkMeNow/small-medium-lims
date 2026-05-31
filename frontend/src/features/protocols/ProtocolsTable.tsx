import { useState } from 'react'
import { Button, Spinner } from '@heroui/react'
import { Search, ChevronLeft, ChevronRight, FlaskConical, Tag } from 'lucide-react'
import { useProtocols } from './hooks'
import { format } from 'date-fns'
import { hr } from 'date-fns/locale'
import type { Protocol } from '../../types/protocols'

interface Props {
  onRunExperiment?: (protocol: Protocol) => void
}

export default function ProtocolsTable({ onRunExperiment }: Props) {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useProtocols({ page, limit: 20, search })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault(); setSearch(searchInput); setPage(1)
  }

  const total = data?.meta.total ?? 0
  const totalPages = Math.ceil(total / 20)

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Pretraži po nazivu ili kategoriji..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-field-background border border-field-border text-field-foreground text-sm placeholder:text-field-placeholder focus:outline-none focus:border-accent"
          />
        </div>
        <Button type="submit" variant="outline" size="sm">Traži</Button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
        ) : isError ? (
          <div className="py-16 text-center">
            <p className="text-sm text-danger">Greška pri učitavanju protokola.</p>
            <p className="text-xs text-muted mt-1">Provjerite je li backend pokrenut.</p>
          </div>
        ) : data?.data.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted">Nema protokola. Dodajte prvi SOP.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-secondary">
              <tr>
                {['Naziv', 'Kategorija', 'Verzija', 'Koraci', 'Eksperimeti', 'Kreirao/la', 'Kreirano', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-separator">
              {data?.data.map((p) => (
                <tr key={p.id} className="hover:bg-surface-secondary transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{p.name}</div>
                    {p.description && <div className="text-xs text-muted truncate max-w-64">{p.description}</div>}
                  </td>
                  <td className="px-4 py-3">
                    {p.category ? (
                      <span className="inline-flex items-center gap-1 text-xs text-accent bg-accent-soft px-2 py-0.5 rounded-md">
                        <Tag size={10} /> {p.category}
                      </span>
                    ) : <span className="text-muted text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-foreground bg-default px-2 py-0.5 rounded-md">v{p.currentVersion}</span>
                  </td>
                  <td className="px-4 py-3 text-muted text-center">—</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-xs text-muted">
                      <FlaskConical size={12} /> {p.experimentCount ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">
                    {p.createdBy.firstName} {p.createdBy.lastName}
                  </td>
                  <td className="px-4 py-3 text-muted text-xs whitespace-nowrap">
                    {format(new Date(p.createdAt), 'd. MMM yyyy.', { locale: hr })}
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="outline" size="sm" onClick={() => onRunExperiment?.(p)}>
                      Pokreni
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">Ukupno: <span className="text-foreground font-medium">{total}</span> protokola</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" isIconOnly isDisabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /></Button>
            <span className="text-sm text-muted">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" isIconOnly isDisabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight size={16} /></Button>
          </div>
        </div>
      )}
    </div>
  )
}
