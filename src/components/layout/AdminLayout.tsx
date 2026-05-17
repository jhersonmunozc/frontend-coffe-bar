import { Outlet } from 'react-router-dom'
import { Sidebar }          from './Sidebar'
import { AlertasProvider }  from '../../context/AlertasContext'

export function AdminLayout() {
  return (
    <AlertasProvider>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </AlertasProvider>
  )
}
