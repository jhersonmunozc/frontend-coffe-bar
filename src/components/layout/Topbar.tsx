import { Search, Download, Plus } from 'lucide-react'

interface TopbarProps {
  title: string
  subtitle: string
  labelBoton: string
  onNuevo: () => void
  searchPlaceholder: string
  searchValue: string
  onSearchChange: (v: string) => void
  onExportar: () => void
}

export function Topbar({
  title, subtitle, labelBoton, onNuevo,
  searchPlaceholder, searchValue, onSearchChange, onExportar,
}: TopbarProps) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '14px 20px', marginBottom: 24,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 12,
    }}>
      <div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
          {title}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{subtitle}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg)', border: '1.5px solid var(--border)',
          borderRadius: 8, padding: '7px 12px', width: 210,
        }}>
          <Search size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13.5, color: 'var(--text)', width: '100%', fontFamily: 'inherit' }}
          />
        </div>
        <button
          onClick={onExportar}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13.5, fontWeight: 500, background: 'transparent', border: '1.5px solid var(--border)', color: 'var(--muted)', fontFamily: 'inherit' }}
        >
          <Download size={14} /> Exportar
        </button>
        <button
          onClick={onNuevo}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, background: 'var(--cafe)', color: '#fff', fontFamily: 'inherit', transition: 'background 0.15s' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--cafe-dark)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--cafe)')}
        >
          <Plus size={14} /> {labelBoton}
        </button>
      </div>
    </div>
  )
}
