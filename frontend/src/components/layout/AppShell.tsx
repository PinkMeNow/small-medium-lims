import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import QuickActions from '../QuickActions'

function readCollapsed() {
  try { return localStorage.getItem('lims-sidebar-collapsed') === 'true' } catch { return false }
}

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem('lims-sidebar-collapsed', String(next)) } catch {}
      return next
    })
  }

  function closeMobile() { setMobileOpen(false) }

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setQuickOpen(v => !v)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar collapsed={collapsed} onToggle={toggle} />
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={closeMobile} />
      )}

      {/* Mobile drawer */}
      <div
        className={[
          'fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-200 ease-in-out shrink-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <Sidebar collapsed={false} onToggle={closeMobile} isMobile onMobileClose={closeMobile} />
      </div>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header
          onMenuClick={() => setMobileOpen(o => !o)}
          onQuickAction={() => setQuickOpen(true)}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Quick actions palette */}
      <QuickActions open={quickOpen} onClose={() => setQuickOpen(false)} />
    </div>
  )
}
