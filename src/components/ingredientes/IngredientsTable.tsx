import { PlusCircle, Pencil, Trash2, Search } from 'lucide-react'
import type { Ingrediente } from '../../types/cafesino.types'
import { getStatus, type EstadoFiltro } from '../../hooks/useIngredientes'

const STATUS_CFG = {
  ok:   { label: 'OK',      color: 'var(--green)', bg: 'var(--green-bg)' },
  low:  { label: 'Bajo',    color: 'var(--amber)', bg: 'var(--amber-bg)' },
  crit: { label: 'Critico', color: 'var(--red)',   bg: 'var(--red-bg)'   },
}

function StockBar({ ing }: { ing: Ingrediente }) {
  const status = getStatus(ing)
  const pct    = Math.min(100, Math.round((ing.stock / (ing.minimo * 3)) * 100))
  const color  = STATUS_CFG[status].color
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>
        {Math.round(ing.stock).toLocaleString('es-CO')}
      </div>
      <div style={{ height: 5, background: '#EDE7DF', borderRadius: 99, width: 90 }}>
        <div style={{ height: 5, width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}

function StatusBadge({ ing }: { ing: Ingrediente }) {
  const status = getStatus(ing)
  const { label, color, bg } = STATUS_CFG[status]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: bg, color, borderRadius: 99, padding: '3px 9px',
      fontSize: 12, fontWeight: 600,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {label}
    </span>
  )
}

const FILTROS: { key: EstadoFiltro; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'ok',   label: '? OK' },
  { key: 'low',  label: '? Bajo' },
  { key: 'crit', label: '? Critico' },
]

const ACT_BTN = (hover: { bg: string; border: string; color: string }) => ({
  base: {
    width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)',
    background: 'transparent', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: 'var(--muted)',
    transition: 'all 0.15s',
  },
  hover,
})

interface IngredientsTableProps {
  rows:       Ingrediente[]
  filtro:     EstadoFiltro
  setFiltro:  (f: EstadoFiltro) => void
  onStock:    (ing: Ingrediente) => void
  onEdit:     (ing: Ingrediente) => void
  onDelete:   (ing: Ingrediente) => void
}

export function IngredientsTable({
  rows, filtro, setFiltro, onStock, onEdit, onDelete,
}: IngredientsTableProps) {
  const TH = {
    fontSize: 11, fontWeight: 600, color: 'var(--muted)',
    textTransform: 'uppercase' as const, letterSpacing: '0.8px',
    padding: '11px 16px', textAlign: 'left' as const,
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
      {/* Card header */}
      <div style={{
        padding: '18px 20px 14px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
          Inventario de ingredientes
        </span>
        {/* Filter tabs */}
        <div style={{
          display: 'flex', background: 'var(--bg)',
          borderRadius: 8, padding: 3, gap: 2,
        }}>
          {FILTROS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFiltro(key)}
              style={{
                padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: 12.5, fontWeight: 500, transition: 'all 0.15s',
                background: filtro === key ? 'var(--surface)' : 'transparent',
                color:      filtro === key ? 'var(--text)'    : 'var(--muted)',
                boxShadow:  filtro === key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)' }}>
          <Search size={32} style={{ margin: '0 auto 10px', opacity: 0.35 }} />
          <p style={{ fontSize: 14 }}>No se encontraron ingredientes</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--bg)' }}>
              <tr>
                {['ID', 'Nombre', 'Stock', 'Unidad', 'M?nimo', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} style={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((ing, idx) => (
                <tr
                  key={ing.ing_id}
                  style={{
                    borderBottom: idx < rows.length - 1 ? '1px solid var(--border)' : 'none',
                    animation: `fadeInRow 0.25s ease both`,
                    animationDelay: `${idx * 30}ms`,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 11.5, color: 'var(--muted)' }}>
                    {ing.ing_id}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--text)' }}>
                    {ing.nombre}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <StockBar ing={ing} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      background: 'var(--bg)', border: '1px solid var(--border)',
                      borderRadius: 5, padding: '2px 7px', fontSize: 11.5, fontWeight: 500, color: 'var(--text)',
                    }}>
                      {ing.u_medida}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--muted)' }}>
                    {Math.round(ing.minimo).toLocaleString('es-CO')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <StatusBadge ing={ing} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {/* +Stock */}
                      <button
                        title="Agregar stock"
                        onClick={() => onStock(ing)}
                        style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', transition: 'all 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--green-bg)'; e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
                      >
                        <PlusCircle size={14} />
                      </button>
                      {/* Editar */}
                      <button
                        title="Editar"
                        onClick={() => onEdit(ing)}
                        style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', transition: 'all 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--amber-bg)'; e.currentTarget.style.borderColor = 'var(--amber)'; e.currentTarget.style.color = 'var(--amber)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
                      >
                        <Pencil size={14} />
                      </button>
                      {/* Eliminar */}
                      <button
                        title="Eliminar"
                        onClick={() => onDelete(ing)}
                        style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', transition: 'all 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--red-bg)'; e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
