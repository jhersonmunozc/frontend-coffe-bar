import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FlaskConical, ShoppingBag, Bell, LogOut, Settings, BookOpen,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { logout } from '../../api/authApi'

const S = {
  sidebar: {
    width: 220, minHeight: '100vh', background: 'var(--text)',
    display: 'flex', flexDirection: 'column' as const, flexShrink: 0,
  },
  logo: {
    padding: '22px 20px 18px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', gap: 12,
  },
  logoIcon: {
    width: 36, height: 36, borderRadius: 10, background: 'var(--cafe)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, flexShrink: 0,
  },
  sectionLabel: {
    fontSize: 10, fontWeight: 600, letterSpacing: '1.5px',
    color: 'rgba(255,255,255,0.3)', padding: '20px 16px 6px', textTransform: 'uppercase' as const,
  },
  nav: { padding: '0 10px', flex: 1 },
  userArea: {
    padding: '14px 14px 20px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', gap: 10,
  },
  avatar: {
    width: 32, height: 32, borderRadius: '50%', background: 'var(--cafe)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: 13, fontWeight: 600, flexShrink: 0,
  },
}

interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
  badge?: number
}

function NavItem({ to, icon, label, badge }: NavItemProps) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 10px', borderRadius: 8, marginBottom: 2,
        color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
        background: isActive ? 'var(--cafe)' : 'transparent',
        fontSize: 14, fontWeight: 500, textDecoration: 'none',
        transition: 'background 0.15s, color 0.15s',
      })}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        if (!el.dataset.active) el.style.background = 'rgba(255,255,255,0.07)'
        el.style.color = '#fff'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        if (!el.dataset.active) el.style.background = 'transparent'
        el.style.color = 'rgba(255,255,255,0.55)'
      }}
    >
      <span style={{ display: 'flex', width: 18, flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge != null && badge > 0 && (
        <span style={{
          background: 'var(--red)', color: '#fff', borderRadius: 99,
          fontSize: 10, fontWeight: 700, padding: '1px 6px', minWidth: 18, textAlign: 'center',
        }}>{badge}</span>
      )}
    </NavLink>
  )
}

interface SidebarProps { alertCount?: number }

export function Sidebar({ alertCount = 0 }: SidebarProps) {
  const navigate = useNavigate()
  const { usuario, clearAuth } = useAuthStore()

  const handleLogout = async () => {
    try { await logout() } catch { /* ya invalido */ }
    clearAuth()
    navigate('/login', { replace: true })
  }

  return (
    <aside style={S.sidebar}>
      {/* Logo */}
      <div style={S.logo}>
        <div style={S.logoIcon}>?</div>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#fff', fontWeight: 600 }}>
            Cafesino
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>
            PANEL DE ADMINISTRACI?N
          </div>
        </div>
      </div>

      {/* Nav principal */}
      <div style={S.nav}>
        <div style={S.sectionLabel}>Navegaci?n</div>
        <NavItem to="/admin/dashboard"    icon={<LayoutDashboard size={18} />} label="Dashboard" />
        <NavItem to="/admin/ingredientes" icon={<FlaskConical size={18} />}    label="Ingredientes" />
        <NavItem to="/admin/productos"    icon={<ShoppingBag size={18} />}     label="Productos" />
        <NavItem to="/admin/recetas"      icon={<BookOpen size={18} />}        label="Recetas" />

        <div style={S.sectionLabel}>Sistema</div>
        <NavItem to="/admin/alertas"      icon={<Bell size={18} />}    label="Alertas" badge={alertCount} />
        <NavItem to="/admin/config"       icon={<Settings size={18} />} label="Configuraci?n" />
      </div>

      {/* Usuario */}
      <div style={S.userArea}>
        <div style={S.avatar}>{usuario?.nombre.charAt(0).toUpperCase()}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {usuario?.nombre}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Administrador</div>
        </div>
        <button
          onClick={handleLogout}
          title="Cerrar sesion"
          style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}
