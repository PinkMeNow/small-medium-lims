import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

function readCollapsed() {
  try { return localStorage.getItem('lims-sidebar-collapsed') === 'true' } catch { return false }
}

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(readCollapsed)

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem('lims-sidebar-collapsed', String(next)) } catch {}
      return next
    })
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
