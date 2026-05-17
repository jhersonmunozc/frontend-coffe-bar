import { Outlet } from 'react-router-dom'
import { BaristaSidebar } from './BaristaSidebar'

export function BaristaLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <BaristaSidebar />
      <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}
