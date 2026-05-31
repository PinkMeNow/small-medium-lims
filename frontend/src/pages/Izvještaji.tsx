import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Button, Spinner, Separator,
  Select, SelectTrigger, SelectValue, SelectIndicator, SelectPopover,
  ListBox, ListBoxItem,
  TextField, Label, Input,
} from '@heroui/react'
import { FlaskConical, Beaker, ClipboardList, Search, Download, Printer } from 'lucide-react'
import { format } from 'date-fns'
import { hr } from 'date-fns/locale'
import { getSamplesReport, getChemicalsReport, getExperimentsReport, getChainOfCustody } from '../api/reports.api'
import { exportCsv } from '../features/reports/exportCsv'
import { SAMPLE_STATUS_LABELS } from '../types/samples'
import { EXPERIMENT_STATUS_LABELS } from '../types/protocols'
import SampleStatusBadge from '../features/samples/SampleStatusBadge'
import type { SampleStatus } from '../types/samples'
import type { ExperimentStatus } from '../types/protocols'

type ReportType = 'samples' | 'chemicals' | 'experiments' | 'chain-of-custody'

const REPORT_TYPES: { id: ReportType; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'samples',          label: 'Uzorci',      icon: FlaskConical,   desc: 'Pregled uzoraka po periodu i statusu' },
  { id: 'chemicals',        label: 'Kemikalije',  icon: Beaker,         desc: 'Trenutačni inventar s upozorenjima' },
  { id: 'experiments',      label: 'Eksperimenti',icon: ClipboardList,  desc: 'Dnevnik provedenih eksperimenata' },
  { id: 'chain-of-custody', label: 'Sljedivost',  icon: Search,         desc: 'Kompletna povijest uzorka (CoC)' },
]

const inputCls = 'px-3 py-2 rounded-xl bg-field-background border border-field-border text-field-foreground text-sm focus:outline-none focus:border-accent'
const thCls = 'px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider whitespace-nowrap'
const tdCls = 'px-4 py-3 text-sm'

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  return format(new Date(d), 'd. MMM yyyy.', { locale: hr })
}

// ─── Samples report ──────────────────────────────────────────────────────────

function SamplesReport() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [status, setStatus] = useState('')
  const [params, setParams] = useState<{ from?: string; to?: string; status?: string }>({})

  const { data, isLoading, isError } = useQuery({
    queryKey: ['report-samples', params],
    queryFn: () => getSamplesReport(params),
    enabled: true,
  })

  function generate() { setParams({ from: from || undefined, to: to || undefined, status: status || undefined }) }

  function downloadCsv() {
    if (!data) return
    exportCsv(`uzorci-${new Date().toISOString().slice(0,10)}.csv`,
      ['Kod', 'Vrsta', 'Izvor', 'Status', 'Zaprimio/la', 'Zaprimljeno'],
      data.rows.map((r: any) => [
        r.code, r.type, r.source,
        SAMPLE_STATUS_LABELS[r.status as SampleStatus] ?? r.status,
        `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim(),
        fmtDate(r.receivedAt),
      ]),
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">Datum od</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">Datum do</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">Status</label>
          <Select selectedKey={status || 'all'} onSelectionChange={(key) => setStatus(key === 'all' ? '' : String(key))}>
            <SelectTrigger className="min-w-32">
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectPopover>
              <ListBox>
                <ListBoxItem id="all">Svi</ListBoxItem>
                {Object.entries(SAMPLE_STATUS_LABELS).map(([v, l]) => <ListBoxItem key={v} id={v}>{l}</ListBoxItem>)}
              </ListBox>
            </SelectPopover>
          </Select>
        </div>
        <Button variant="primary" size="sm" onClick={generate}>Generiraj</Button>
        {data && <Button variant="outline" size="sm" onClick={downloadCsv}><Download size={14} /> CSV</Button>}
        {data && <Button variant="outline" size="sm" onClick={() => window.print()}><Printer size={14} /> Ispiši</Button>}
      </div>

      {isLoading && <div className="flex justify-center py-8"><Spinner /></div>}
      {isError && <p className="text-sm text-danger">Greška — je li backend pokrenut?</p>}
      {data && (
        <>
          <div className="flex flex-wrap gap-x-6 gap-y-2 p-4 rounded-xl bg-surface-secondary border border-border text-sm">
            <span className="text-muted">Ukupno: <b className="text-foreground">{data.total}</b></span>
            {Object.entries(data.summary as Record<string, number>).map(([s, n]) => (
              <span key={s} className="text-muted">{SAMPLE_STATUS_LABELS[s as SampleStatus] ?? s}: <b className="text-foreground">{n}</b></span>
            ))}
          </div>
          <ReportTable
            headers={['Kod', 'Vrsta', 'Izvor', 'Status', 'Zaprimio/la', 'Zaprimljeno']}
            rows={data.rows.map((r: any) => [
              <span className="font-mono font-medium">{r.code}</span>,
              r.type, r.source,
              <SampleStatusBadge status={r.status} />,
              `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim(),
              fmtDate(r.receivedAt),
            ])}
          />
        </>
      )}
    </div>
  )
}

// ─── Chemicals report ─────────────────────────────────────────────────────────

function ChemicalsReport() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['report-chemicals'],
    queryFn: getChemicalsReport,
  })

  const today = new Date(); today.setHours(0,0,0,0)
  const soon = new Date(today); soon.setDate(soon.getDate() + 30)

  function getStatus(expiryDate: string, qty: number, minQty: number) {
    const exp = new Date(expiryDate)
    if (exp < today) return 'Istekao'
    if (exp <= soon) return 'Ističe uskoro'
    if (qty <= minQty && minQty > 0) return 'Niske zalihe'
    return 'Uredu'
  }

  function downloadCsv() {
    if (!data) return
    exportCsv(`kemikalije-${new Date().toISOString().slice(0,10)}.csv`,
      ['Naziv', 'CAS broj', 'Količina', 'Jedinica', 'Lokacija', 'Rok trajanja', 'Status'],
      data.rows.map((r: any) => [
        r.name, r.casNumber ?? '', r.quantity, r.unit,
        r.storageLocation, fmtDate(r.expiryDate),
        getStatus(r.expiryDate, Number(r.quantity), Number(r.minQuantity)),
      ]),
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {data && <Button variant="outline" size="sm" onClick={downloadCsv}><Download size={14} /> CSV</Button>}
        {data && <Button variant="outline" size="sm" onClick={() => window.print()}><Printer size={14} /> Ispiši</Button>}
      </div>
      {isLoading && <div className="flex justify-center py-8"><Spinner /></div>}
      {isError && <p className="text-sm text-danger">Greška — je li backend pokrenut?</p>}
      {data && (
        <>
          <div className="flex flex-wrap gap-x-6 gap-y-2 p-4 rounded-xl bg-surface-secondary border border-border text-sm">
            <span className="text-muted">Ukupno: <b className="text-foreground">{data.summary.total}</b></span>
            <span className="text-danger">Isteklo: <b>{data.summary.expired}</b></span>
            <span className="text-warning">Ističe uskoro: <b>{data.summary.expiringSoon}</b></span>
            <span className="text-warning">Niske zalihe: <b>{data.summary.lowStock}</b></span>
          </div>
          <ReportTable
            headers={['Naziv', 'CAS broj', 'Količina', 'Lokacija', 'Rok trajanja', 'Status']}
            rows={data.rows.map((r: any) => {
              const st = getStatus(r.expiryDate, Number(r.quantity), Number(r.minQuantity))
              const stColor = st === 'Istekao' ? 'text-danger' : st === 'Ističe uskoro' || st === 'Niske zalihe' ? 'text-warning' : 'text-success'
              return [
                <span className="font-medium">{r.name}</span>,
                <span className="font-mono text-xs">{r.casNumber ?? '—'}</span>,
                `${r.quantity} ${r.unit}`,
                r.storageLocation,
                fmtDate(r.expiryDate),
                <span className={`text-xs font-medium ${stColor}`}>{st}</span>,
              ]
            })}
          />
        </>
      )}
    </div>
  )
}

// ─── Experiments report ───────────────────────────────────────────────────────

function ExperimentsReport() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [params, setParams] = useState<{ from?: string; to?: string }>({})

  const { data, isLoading, isError } = useQuery({
    queryKey: ['report-experiments', params],
    queryFn: () => getExperimentsReport(params),
    enabled: true,
  })

  function generate() { setParams({ from: from || undefined, to: to || undefined }) }

  function downloadCsv() {
    if (!data) return
    exportCsv(`eksperimenti-${new Date().toISOString().slice(0,10)}.csv`,
      ['Naslov', 'Protokol', 'Verzija', 'Status', 'Operator', 'Započeto', 'Završeno'],
      data.rows.map((r: any) => [
        r.title, r.protocolName ?? '', r.protocolVersion ?? '',
        EXPERIMENT_STATUS_LABELS[r.status as ExperimentStatus] ?? r.status,
        `${r.operatorFirst ?? ''} ${r.operatorLast ?? ''}`.trim(),
        fmtDate(r.startedAt), fmtDate(r.completedAt),
      ]),
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">Datum od</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">Datum do</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
        </div>
        <Button variant="primary" size="sm" onClick={generate}>Generiraj</Button>
        {data && <Button variant="outline" size="sm" onClick={downloadCsv}><Download size={14} /> CSV</Button>}
        {data && <Button variant="outline" size="sm" onClick={() => window.print()}><Printer size={14} /> Ispiši</Button>}
      </div>
      {isLoading && <div className="flex justify-center py-8"><Spinner /></div>}
      {isError && <p className="text-sm text-danger">Greška — je li backend pokrenut?</p>}
      {data && (
        <>
          <div className="flex flex-wrap gap-x-6 gap-y-2 p-4 rounded-xl bg-surface-secondary border border-border text-sm">
            <span className="text-muted">Ukupno: <b className="text-foreground">{data.total}</b></span>
            {Object.entries(data.summary as Record<string, number>).map(([s, n]) => (
              <span key={s} className="text-muted">{EXPERIMENT_STATUS_LABELS[s as ExperimentStatus] ?? s}: <b className="text-foreground">{n}</b></span>
            ))}
          </div>
          <ReportTable
            headers={['Naslov', 'Protokol', 'Verzija', 'Status', 'Operator', 'Započeto', 'Završeno']}
            rows={data.rows.map((r: any) => [
              r.title,
              r.protocolName ?? '—',
              <span className="font-mono text-xs bg-default px-1.5 py-0.5 rounded">{r.protocolVersion ? `v${r.protocolVersion}` : '—'}</span>,
              EXPERIMENT_STATUS_LABELS[r.status as ExperimentStatus] ?? r.status,
              `${r.operatorFirst ?? ''} ${r.operatorLast ?? ''}`.trim(),
              fmtDate(r.startedAt),
              fmtDate(r.completedAt),
            ])}
          />
        </>
      )}
    </div>
  )
}

// ─── Chain of Custody ─────────────────────────────────────────────────────────

function ChainOfCustody() {
  const [sampleId, setSampleId] = useState('')
  const [activeId, setActiveId] = useState('')

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['report-coc', activeId],
    queryFn: () => getChainOfCustody(activeId),
    enabled: !!activeId,
    retry: false,
  })

  const EVENT_LABELS: Record<string, string> = {
    created: 'Registracija uzorka',
    status_change: 'Promjena statusa',
    note_added: 'Bilješka dodana',
  }

  function downloadCsv() {
    if (!data) return
    exportCsv(`sljedivost-${data.sample.code}-${new Date().toISOString().slice(0,10)}.csv`,
      ['Događaj', 'Stari status', 'Novi status', 'Bilješka', 'Korisnik', 'Datum'],
      data.events.map((e: any) => [
        EVENT_LABELS[e.eventType] ?? e.eventType,
        e.oldStatus ? (SAMPLE_STATUS_LABELS[e.oldStatus as SampleStatus] ?? e.oldStatus) : '',
        e.newStatus ? (SAMPLE_STATUS_LABELS[e.newStatus as SampleStatus] ?? e.newStatus) : '',
        e.notes ?? '', e.user, fmtDate(e.createdAt),
      ]),
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3 items-end">
        <TextField value={sampleId} onChange={setSampleId} className="flex-1 max-w-sm">
          <Label className="text-xs text-muted">ID uzorka (UUID)</Label>
          <Input placeholder="npr. 550e8400-e29b-41d4-a716-..." className="mt-0.5" />
        </TextField>
        <Button variant="primary" size="sm" onClick={() => setActiveId(sampleId)} isDisabled={!sampleId.trim()}>Pretraži</Button>
        {data && <Button variant="outline" size="sm" onClick={downloadCsv}><Download size={14} /> CSV</Button>}
        {data && <Button variant="outline" size="sm" onClick={() => window.print()}><Printer size={14} /> Ispiši</Button>}
      </div>

      {(isLoading || isFetching) && <div className="flex justify-center py-8"><Spinner /></div>}
      {isError && <p className="text-sm text-danger">Uzorak nije pronađen ili je greška u mreži.</p>}

      {data && (
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-surface-secondary border border-border">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div><p className="text-xs text-muted">Kod</p><p className="font-mono font-medium text-foreground">{data.sample.code}</p></div>
              <div><p className="text-xs text-muted">Vrsta</p><p className="text-foreground">{data.sample.type}</p></div>
              <div><p className="text-xs text-muted">Izvor</p><p className="text-foreground truncate">{data.sample.source}</p></div>
              <div><p className="text-xs text-muted">Zaprimio/la</p><p className="text-foreground">{data.sample.receivedBy}</p></div>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-foreground">Povijest ({data.events.length} događaja)</h3>
          <ReportTable
            headers={['Događaj', 'Stari status', 'Novi status', 'Bilješka', 'Korisnik', 'Datum']}
            rows={data.events.map((e: any) => [
              EVENT_LABELS[e.eventType] ?? e.eventType,
              e.oldStatus ? (SAMPLE_STATUS_LABELS[e.oldStatus as SampleStatus] ?? e.oldStatus) : '—',
              e.newStatus ? (SAMPLE_STATUS_LABELS[e.newStatus as SampleStatus] ?? e.newStatus) : '—',
              e.notes ?? '—', e.user, fmtDate(e.createdAt),
            ])}
          />
        </div>
      )}
    </div>
  )
}

// ─── Shared table ─────────────────────────────────────────────────────────────

function ReportTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  if (rows.length === 0) return <p className="text-sm text-muted py-4 text-center">Nema podataka za odabrane filtre.</p>

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface print:border-0">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-surface-secondary print:bg-transparent">
          <tr>{headers.map((h) => <th key={h} className={thCls}>{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-separator">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-surface-secondary transition-colors print:hover:bg-transparent">
              {row.map((cell, j) => <td key={j} className={tdCls}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Izvještaji() {
  const [active, setActive] = useState<ReportType>('samples')

  const PANELS: Record<ReportType, React.ReactNode> = {
    samples: <SamplesReport />,
    chemicals: <ChemicalsReport />,
    experiments: <ExperimentsReport />,
    'chain-of-custody': <ChainOfCustody />,
  }

  return (
    <div className="flex flex-col gap-6 print:gap-4">
      <div className="print:hidden">
        <h1 className="text-2xl font-semibold text-foreground">Izvještaji</h1>
        <p className="text-sm text-muted mt-1">Generiranje i izvoz podataka za reviziju i compliance</p>
      </div>

      {/* Report type tabs */}
      <div className="flex gap-2 flex-wrap print:hidden">
        {REPORT_TYPES.map(({ id, label, icon: Icon, desc }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={[
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border',
              active === id
                ? 'bg-accent text-white border-accent'
                : 'bg-surface text-muted border-border hover:bg-surface-secondary hover:text-foreground',
            ].join(' ')}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <Separator className="print:hidden" />

      {/* Active report panel */}
      <div>
        <div className="mb-4 print:hidden">
          <p className="text-xs text-muted uppercase tracking-wider font-medium">
            {REPORT_TYPES.find((r) => r.id === active)?.desc}
          </p>
        </div>
        {PANELS[active]}
      </div>
    </div>
  )
}
