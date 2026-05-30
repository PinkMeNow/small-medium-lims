import { Card, CardContent } from '@heroui/react'
import { FlaskConical, Beaker, ClipboardList, BarChart3 } from 'lucide-react'

const stats = [
  { label: 'Uzorci u obradi', value: '—', icon: FlaskConical },
  { label: 'Kemikalije', value: '—', icon: Beaker },
  { label: 'Aktivni protokoli', value: '—', icon: ClipboardList },
  { label: 'Izvještaji ovaj mj.', value: '—', icon: BarChart3 },
]

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Nadzorna ploča</h1>
        <p className="text-sm text-muted mt-1">Pregled stanja laboratorija</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex flex-row items-center gap-4 p-5">
              <div className="p-2 rounded-lg bg-accent-soft text-accent shrink-0">
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-semibold text-foreground">{value}</p>
                <p className="text-xs text-muted truncate">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted text-center py-8">
            Nedavne aktivnosti će se prikazati ovdje.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
