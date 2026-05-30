import { useState } from 'react'
import { Button, Spinner } from '@heroui/react'
import { Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { useChemicals } from './hooks'
import GHSBadge from './GHSBadge'
import ChemicalStatusBadge from './ChemicalStatusBadge'
import { getChemicalStatus } from '../../types/chemicals'
import { format, differenceInDays } from 'date-fns'
import { hr } from 'date-fns/locale'

const ALERT_OPTIONS = [
  { value: '', label: 'Svi' },
  { value: 'expired', label: 'Istekli' },
  { value: 'expiring_soon', label: 'Ističu uskoro' },
  { value: 'low_stock', label: 'Niske zalihe' },
]

export default function ChemicalsTable() {
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [alert, setAlert] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useChemicals({ page, limit: 20, search, alert: alert || undefined })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const total = data?.meta.total ?? 0
  const totalPages = Math.ceil(total / 20)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Pretraži po nazivu, CAS broju, lokaciji..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-field-background border border-field-border text-field-foreground text-sm placeholder:text-field-placeholder focus:outline-none focus:border-accent"
            />
          </div>
          <Button type="submit" variant="outline" size="sm">Traži</Button>
        </form>
        <select
          value={alert}
          onChange={(e) => { setAlert(e.target.value); setPage(1) }}
          className="px-3 py-2 rounded-xl bg-field-background border border-field-border text-field-foreground text-sm focus:outline-none focus:border-accent"
        >
          {ALERT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
        ) : isError ? (
          <div className="py-16 text-center">
            <p className="text-sm text-danger">Greška pri učitavanju kemikalija.</p>
            <p className="text-xs text-muted mt-1">Provjerite je li backend pokrenut.</p>
          </div>
        ) : data?.data.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted">Nema kemikalija koje odgovaraju pretrazi.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-secondary">
              <tr>
                {['Naziv', 'CAS broj', 'Količina', 'Lokacija', 'Rok trajanja', 'GHS', 'Status', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-separator">
              {data?.data.map((c) => {
                const status = getChemicalStatus(c)
                const daysLeft = differenceInDays(new Date(c.expiryDate), new Date())
                return (
                  <tr key={c.id} className="hover:bg-surface-secondary transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground max-w-48">
                      <div className="truncate">{c.name}</div>
                      {c.manufacturer && <div className="text-xs text-muted truncate">{c.manufacturer}</div>}
                    </td>
                    <td className="px-4 py-3 font-mono text-muted text-xs">{c.casNumber ?? '—'}</td>
                    <td className="px-4 py-3 text-foreground whitespace-nowrap">
                      {c.quantity} {c.unit}
                      {Number(c.minQuantity) > 0 && (
                        <div className="text-xs text-muted">min. {c.minQuantity} {c.unit}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted max-w-32">
                      <div className="truncate">{c.storageLocation}</div>
                      {(c.storageTempMin != null || c.storageTempMax != null) && (
                        <div className="text-xs text-muted">
                          {c.storageTempMin ?? '?'}°C – {c.storageTempMax ?? '?'}°C
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className={status === 'expired' ? 'text-danger text-xs font-medium' : status === 'expiring_soon' ? 'text-warning text-xs font-medium' : 'text-muted text-xs'}>
                        {format(new Date(c.expiryDate), 'd. MMM yyyy.', { locale: hr })}
                      </div>
                      {daysLeft >= 0 && daysLeft <= 30 && (
                        <div className="text-xs text-warning">za {daysLeft} dana</div>
                      )}
                      {daysLeft < 0 && (
                        <div className="text-xs text-danger">prije {Math.abs(daysLeft)} dana</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.ghsClasses.length > 0
                          ? c.ghsClasses.map((g) => <GHSBadge key={g} code={g} />)
                          : <span className="text-xs text-muted">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ChemicalStatusBadge status={status} />
                    </td>
                    <td className="px-4 py-3">
                      {c.sdsUrl && (
                        <a href={c.sdsUrl} target="_blank" rel="noreferrer" className="text-accent hover:text-accent-hover" title="Otvori SDS">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">Ukupno: <span className="text-foreground font-medium">{total}</span> kemikalija</p>
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
