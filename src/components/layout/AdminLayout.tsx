import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FlaskConical,
  ShoppingBag,
  Bell,
  LogOut,
  Menu,
  X,
  Coffee,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { logout } from '../../api/authApi'

const NAV_ITEMS = [
  { to: '/admin/dashboard',    label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/admin/ingredientes', label: 'Ingredientes',  icon: FlaskConical },
  { to: '/admin/productos',    label: 'Productos',     icon: ShoppingBag },
  { to: '/admin/alertas',      label: 'Alertas',       icon: Bell },
]

const SIDEBAR_BG = '#1a0e06'
const ACTIVE_BG  = '#af4c0f'

export function AdminLayout() {
  const navigate = useNavigate()
  const { usuario, clearAuth } = useAuthStore()
  const [open, setOpen] = useState(true)

  const handleLogout = async () => {
    try { await logout() } catch { /* token ya invalido */ }
    clearAuth()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#f0f2f5' }}>

      {/* Sidebar */}
      <aside
        className="flex flex-col flex-shrink-0 transition-all duration-300"
        style={{ width: open ? 240 : 68, background: SIDEBAR_BG, minHeight: '100vh' }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 border-b border-white/10"
          style={{ height: 72 }}
        >
          <div
            className="flex items-center justify-center rounded-lg flex-shrink-0"
            style={{ width: 38, height: 38, background: '#af4c0f' }}
          >
            <Coffee size={20} color="#fff" />
          </div>
          {open && (
            <div>
              <p
                className="text-white font-bold text-lg leading-none tracking-wider"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Cafesino
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#C4956A', letterSpacing: '0.08em' }}>
                Panel Admin
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex flex-col px-3 py-6 flex-1" style={{ gap: 6 }}>
          {open && (
            <p className="text-xs font-semibold uppercase tracking-widest mb-2 px-3" style={{ color: '#6b4c30' }}>
              Navegacion
            </p>
          )}
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className="flex items-center gap-3.5 rounded-xl text-sm font-medium transition-all"
              style={({ isActive }) => ({
                background: isActive ? ACTIVE_BG : 'transparent',
                color: isActive ? '#fff' : '#C4956A',
                padding: open ? '13px 16px' : '13px 0',
                justifyContent: open ? 'flex-start' : 'center',
              })}
            >
              <Icon size={19} style={{ flexShrink: 0 }} />
              {open && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3.5 border-t border-white/10 transition-all hover:opacity-70"
          style={{
            color: '#C4956A',
            padding: open ? '18px 20px' : '18px 0',
            justifyContent: open ? 'flex-start' : 'center',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <LogOut size={19} style={{ flexShrink: 0 }} />
          {open && <span>Cerrar sesion</span>}
        </button>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Topbar */}
        <header
          className="flex items-center justify-between px-6 shadow-sm"
          style={{ background: SIDEBAR_BG, borderBottom: '3px solid #af4c0f', height: 72 }}
        >
          <button
            onClick={() => setOpen((v) => !v)}
            className="transition hover:opacity-70"
            style={{ color: '#C4956A' }}
            aria-label="Toggle sidebar"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="flex items-center gap-3 pr-4" style={{ color: '#C4956A' }}>
            <div
              className="flex items-center justify-center rounded-full font-bold text-sm"
              style={{ width: 36, height: 36, background: '#af4c0f', color: '#fff', flexShrink: 0 }}
            >
              {usuario?.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-white leading-none">{usuario?.nombre}</span>
              <span className="text-xs mt-0.5" style={{ color: '#C4956A' }}>Administrador</span>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

    </div>
  )
}
