import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

function readCollapsed() {
  try { return localStorage.getItem('lims-sidebar-collapsed') === 'true' } catch { return false }
}

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem('lims-sidebar-collapsed', String(next)) } catch {}
      return next
    })
  }

  function closeMobile() { setMobileOpen(false) }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar — always visible */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar collapsed={collapsed} onToggle={toggle} />
      </div>

      {/* Mobile sidebar backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={[
          'fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-200 ease-in-out shrink-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <Sidebar collapsed={false} onToggle={closeMobile} isMobile onMobileClose={closeMobile} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header onMenuClick={() => setMobileOpen((o) => !o)} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
