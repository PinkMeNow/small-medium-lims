import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FlaskConical, Beaker,
  ClipboardList, BarChart3, Users, HelpCircle,
  LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react'
import {
  Button, Separator,
  TooltipRoot, TooltipTrigger, TooltipContent,
} from '@heroui/react'
import { useAuthStore } from '../../stores/auth.store'
import { logout } from '../../api/auth.api'

const NAV = [
  { href: '/',           icon: LayoutDashboard, label: 'Nadzorna ploča', end: true },
  { href: '/uzorci',     icon: FlaskConical,    label: 'Uzorci' },
  { href: '/kemikalije', icon: Beaker,          label: 'Kemikalije' },
  { href: '/protokoli',  icon: ClipboardList,   label: 'Protokoli' },
  { href: '/izvještaji', icon: BarChart3,        label: 'Izvještaji' },
  { href: '/pomoc',      icon: HelpCircle,      label: 'Pomoć' },
]

const ADMIN_NAV = [
  { href: '/korisnici', icon: Users, label: 'Korisnici' },
]

interface Props {
  collapsed: boolean
  onToggle: () => void
  isMobile?: boolean
  onMobileClose?: () => void
}

interface NavItemProps {
  href: string
  icon: React.ElementType
  label: string
  end?: boolean
  collapsed: boolean
  onMobileClose?: () => void
}

function NavItem({ href, icon: Icon, label, end, collapsed, onMobileClose }: NavItemProps) {
  const link = (
    <NavLink
      to={href}
      end={end}
      onClick={onMobileClose}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium',
          isActive
            ? 'bg-accent-soft text-accent'
            : 'text-muted hover:bg-default hover:text-foreground',
          collapsed ? 'justify-center' : '',
        ].join(' ')
      }
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  )

  if (collapsed) {
    return (
      <TooltipRoot>
        <TooltipTrigger className="block w-full">{link}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </TooltipRoot>
    )
  }
  return link
}

export default function Sidebar({ collapsed, onToggle, isMobile, onMobileClose }: Props) {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  async function handleLogout() {
    try { await logout() } catch { /* ignore */ }
    clearAuth()
    navigate('/prijava', { replace: true })
  }

  const effectiveCollapsed = isMobile ? false : collapsed

  return (
    <aside
      className={[
        'flex flex-col h-screen bg-surface border-r border-border shrink-0',
        'transition-all duration-200 overflow-hidden',
        effectiveCollapsed ? 'w-16' : 'w-64',
      ].join(' ')}
    >
      {/* Brand */}
      <div className={['flex items-center h-14 border-b border-border shrink-0 px-4 gap-2', effectiveCollapsed ? 'justify-center' : ''].join(' ')}>
        <FlaskConical size={20} className="text-accent shrink-0" />
        {!effectiveCollapsed && <span className="font-semibold text-foreground text-base tracking-tight">LIMS</span>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
        {NAV.map((item) => (
          <NavItem key={item.href} {...item} collapsed={effectiveCollapsed} onMobileClose={onMobileClose} />
        ))}

        {user?.role === 'admin' && (
          <>
            <Separator className="my-2" />
            {ADMIN_NAV.map((item) => (
              <NavItem key={item.href} {...item} collapsed={effectiveCollapsed} onMobileClose={onMobileClose} />
            ))}
          </>
        )}
      </nav>

      {/* User info */}
      {!effectiveCollapsed && user && (
        <div className="px-4 py-3 border-t border-border shrink-0">
          <p className="text-sm font-medium text-foreground truncate">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-muted truncate">{user.email}</p>
        </div>
      )}

      {/* Logout + collapse */}
      <div className="border-t border-border p-2 shrink-0 flex flex-col gap-1">
        <Button
          variant="ghost"
          size="sm"
          isIconOnly={effectiveCollapsed}
          className={['w-full text-danger', effectiveCollapsed ? '' : 'justify-start gap-2'].join(' ')}
          onClick={handleLogout}
          aria-label="Odjava"
        >
          <LogOut size={16} />
          {!effectiveCollapsed && 'Odjava'}
        </Button>

        {/* Collapse toggle — desktop only */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            className="w-full"
            onClick={onToggle}
            aria-label={collapsed ? 'Proširi izbornik' : 'Sažmi izbornik'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        )}
      </div>
    </aside>
  )
}
