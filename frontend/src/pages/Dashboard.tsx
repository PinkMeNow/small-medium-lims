import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, Spinner, Chip } from '@heroui/react'
import { FlaskConical, Beaker, ClipboardList, BarChart3, AlertTriangle } from 'lucide-react'
import { getDashboardStats, getRecentActivity } from '../api/dashboard.api'
import { SAMPLE_STATUS_LABELS } from '../types/samples'
import type { SampleStatus } from '../types/samples'
import { format, formatDistanceToNow } from 'date-fns'
import { hr } from 'date-fns/locale'

const EVENT_LABELS: Record<string, string> = {
  created: 'Registriran uzorak',
  status_change: 'Promjena statusa',
  note_added: 'Dodana bilješka',
}

const STATUS_COLOR: Record<SampleStatus, 'primary' | 'warning' | 'success' | 'default' | 'danger'> = {
  received: 'primary',
  processing: 'warning',
  analysed: 'success',
  archived: 'default',
  destroyed: 'danger',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const stats = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats, refetchInterval: 60_000 })
  const activity = useQuery({ queryKey: ['dashboard-activity'], queryFn: getRecentActivity, refetchInterval: 30_000 })

  const statCards = [
    {
      label: 'Uzorci u obradi',
      value: stats.data?.samplesInProgress,
      sub: stats.data ? `od ${stats.data.samplesTotal} ukupno` : undefined,
      icon: FlaskConical,
      alert: false,
      onClick: () => navigate('/uzorci'),
    },
    {
      label: 'Kemikalije — upozorenja',
      value: stats.data?.chemicalsAlerts,
      sub: 'istekle ili niske zalihe',
      icon: Beaker,
      alert: (stats.data?.chemicalsAlerts ?? 0) > 0,
      onClick: () => navigate('/kemikalije'),
    },
    {
      label: 'Aktivni protokoli',
      value: stats.data?.activeProtocols,
      sub: 'SOP predlošci',
      icon: ClipboardList,
      alert: false,
      onClick: () => navigate('/protokoli'),
    },
    {
      label: 'Eksperimenti ovaj mj.',
      value: stats.data?.experimentsThisMonth,
      sub: undefined,
      icon: BarChart3,
      alert: false,
      onClick: () => navigate('/protokoli'),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Nadzorna ploča</h1>
        <p className="text-sm text-muted mt-1">Pregled stanja laboratorija</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, sub, icon: Icon, alert, onClick }) => (
          <Card
            key={label}
            onClick={onClick}
            className="cursor-pointer hover:shadow-surface transition-shadow"
          >
            <CardContent className="flex flex-row items-center gap-4 p-5">
              <div className={`p-2 rounded-lg shrink-0 ${alert ? 'bg-warning-soft text-warning' : 'bg-accent-soft text-accent'}`}>
                {alert ? <AlertTriangle size={20} /> : <Icon size={20} />}
              </div>
              <div className="min-w-0">
                {stats.isLoading ? (
                  <Spinner size="sm" />
                ) : (
                  <p className={`text-2xl font-semibold ${alert && value ? 'text-warning' : 'text-foreground'}`}>
                    {value ?? '—'}
                  </p>
                )}
                <p className="text-xs text-muted truncate">{label}</p>
                {sub && <p className="text-xs text-muted/70 truncate">{sub}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent activity */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Nedavne aktivnosti</h2>
          {activity.isLoading ? (
            <div className="flex justify-center py-6"><Spinner /></div>
          ) : activity.isError ? (
            <p className="text-sm text-muted text-center py-6">Aktivnosti nisu dostupne.</p>
          ) : !activity.data?.length ? (
            <p className="text-sm text-muted text-center py-6">Nema nedavnih aktivnosti.</p>
          ) : (
            <div className="flex flex-col divide-y divide-separator">
              {activity.data.map(event => (
                <div key={event.id} className="flex items-start gap-3 py-3">
                  <div className="shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-accent mt-1.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground font-mono">{event.sampleCode}</span>
                      <span className="text-xs text-muted">{event.sampleType}</span>
                      {event.newStatus && (
                        <Chip size="sm" color={STATUS_COLOR[event.newStatus as SampleStatus] ?? 'default'} variant="soft">
                          {SAMPLE_STATUS_LABELS[event.newStatus as SampleStatus] ?? event.newStatus}
                        </Chip>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      {EVENT_LABELS[event.eventType] ?? event.eventType}
                      {event.notes && ` — ${event.notes.slice(0, 60)}${event.notes.length > 60 ? '...' : ''}`}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted">{event.user}</p>
                    <p className="text-xs text-muted/70" title={format(new Date(event.createdAt), 'dd.MM.yyyy HH:mm')}>
                      {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true, locale: hr })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
