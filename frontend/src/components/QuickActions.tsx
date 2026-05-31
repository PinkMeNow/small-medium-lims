import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FlaskConical, Beaker, ClipboardList,
  BarChart3, Users, HelpCircle, Search,
} from 'lucide-react'
import { useAuthStore } from '../stores/auth.store'

// Detect Mac for Cmd vs Ctrl display
const isMac = typeof navigator !== 'undefined'
  && (/Mac|iPhone|iPad|iPod/.test(navigator.platform) || navigator.userAgentData?.platform === 'macOS')

export const SHORTCUT_LABEL = isMac ? '⌘K' : 'Ctrl K'
export const SHORTCUT_KEY = isMac ? '⌘' : 'Ctrl'

interface Action {
  id: string
  label: string
  icon: React.ElementType
  href?: string
  section: string
  adminOnly?: boolean
  keywords?: string
}

const ACTIONS: Action[] = [
  { id: 'nav-dashboard', label: 'Nadzorna ploča', icon: LayoutDashboard, href: '/', section: 'Navigacija', keywords: 'home početak' },
  { id: 'nav-uzorci', label: 'Uzorci', icon: FlaskConical, href: '/uzorci', section: 'Navigacija', keywords: 'samples uzorci' },
  { id: 'nav-kemikalije', label: 'Kemikalije', icon: Beaker, href: '/kemikalije', section: 'Navigacija', keywords: 'chemicals reagensi inventar' },
  { id: 'nav-protokoli', label: 'Protokoli i eksperimenti', icon: ClipboardList, href: '/protokoli', section: 'Navigacija', keywords: 'sop protokoli eksperimenti' },
  { id: 'nav-izvjestaji', label: 'Izvještaji', icon: BarChart3, href: '/izvještaji', section: 'Navigacija', keywords: 'izvještaji csv pdf' },
  { id: 'nav-pomoc', label: 'Pomoć', icon: HelpCircle, href: '/pomoc', section: 'Navigacija', keywords: 'help pomoc dokumentacija' },
  { id: 'nav-korisnici', label: 'Korisnici', icon: Users, href: '/korisnici', section: 'Navigacija', adminOnly: true, keywords: 'korisnici admin' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function QuickActions({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    const actions = ACTIONS.filter(a => !a.adminOnly || user?.role === 'admin')
    if (!query.trim()) return actions
    const q = query.toLowerCase()
    return actions.filter(a =>
      a.label.toLowerCase().includes(q) ||
      (a.keywords ?? '').toLowerCase().includes(q) ||
      a.section.toLowerCase().includes(q)
    )
  }, [query, user?.role])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => { setActiveIdx(0) }, [query])

  function execute(action: Action) {
    if (action.href) navigate(action.href)
    onClose()
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && filtered[activeIdx]) execute(filtered[activeIdx])
  }

  if (!open) return null

  // Group by section
  const sections: Record<string, (Action & { _idx: number })[]> = {}
  filtered.forEach((a, i) => {
    if (!sections[a.section]) sections[a.section] = []
    sections[a.section].push({ ...a, _idx: i })
  })

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg mx-4 bg-overlay border border-border rounded-2xl shadow-overlay overflow-hidden"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKey}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-separator">
          <Search size={16} className="text-muted shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Pretraži akcije..."
            className="flex-1 bg-transparent text-foreground text-sm placeholder:text-muted outline-none"
          />
          <kbd className="text-xs text-muted bg-default px-1.5 py-0.5 rounded font-mono">Esc</kbd>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[50vh] py-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">Nema rezultata za "{query}"</p>
          ) : (
            Object.entries(sections).map(([section, actions]) => (
              <div key={section}>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider px-4 py-1.5">{section}</p>
                {actions.map(action => {
                  const Icon = action.icon
                  const isActive = action._idx === activeIdx
                  return (
                    <button
                      key={action.id}
                      onClick={() => execute(action)}
                      onMouseEnter={() => setActiveIdx(action._idx)}
                      className={[
                        'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                        isActive ? 'bg-accent-soft text-accent' : 'text-foreground hover:bg-default',
                      ].join(' ')}
                    >
                      <Icon size={16} className="shrink-0" />
                      <span>{action.label}</span>
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-separator px-4 py-2 flex items-center gap-4 text-xs text-muted">
          <span><kbd className="bg-default px-1 rounded font-mono">↑↓</kbd> navigacija</span>
          <span><kbd className="bg-default px-1 rounded font-mono">↵</kbd> otvori</span>
          <span><kbd className="bg-default px-1 rounded font-mono">Esc</kbd> zatvori</span>
        </div>
      </div>
    </div>
  )
}
