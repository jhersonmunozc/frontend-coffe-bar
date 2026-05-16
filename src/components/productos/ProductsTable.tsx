import { Pencil, Trash2, ShoppingBag, Coffee, Utensils, IceCream, Star } from 'lucide-react'
import type { Producto } from '../../types/cafesino.types'
import { ToggleSwitch } from '../shared/ToggleSwitch'

type FiltroCategoria = 'todos' | string
type FiltroDisp      = 'todos' | 'si' | 'no'

const CATEG_CFG: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  Comida:  { bg: '#FFF3E0', color: '#E65100', icon: <Utensils size={13} /> },
  Bebida:  { bg: '#E3F2FD', color: '#0D47A1', icon: <Coffee size={13} /> },
  Postre:  { bg: '#FCE4EC', color: '#880E4F', icon: <IceCream size={13} /> },
  Especial:{ bg: '#F3E5F5', color: '#4A148C', icon: <Star size={13} /> },
}

const CATS: FiltroCategoria[] = ['todos', 'Comida', 'Bebida', 'Postre', 'Especial']

function CategoriaBadge({ cat }: { cat: string }) {
  const cfg = CATEG_CFG[cat] ?? { bg: '#f0f0f0', color: '#666', icon: null }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: cfg.bg, color: cfg.color, borderRadius: 6,
      padding: '3px 10px', fontSize: 12, fontWeight: 600,
    }}>
      {cfg.icon} {cat}
    </span>
  )
}

function TabGroup<T extends string>({ options, active, onSelect, labelFn }: {
  options: T[]; active: T; onSelect: (v: T) => void; labelFn?: (v: T) => string
}) {
  return (
    <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 8, padding: 3, gap: 2 }}>
      {options.map((opt) => (
        <button key={opt} onClick={() => onSelect(opt)} style={{
          padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
          fontSize: 12.5, fontWeight: 500, transition: 'all 0.15s',
          background: active === opt ? 'var(--surface)' : 'transparent',
          color:      active === opt ? 'var(--text)'    : 'var(--muted)',
          boxShadow:  active === opt ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
        }}>
          {labelFn ? labelFn(opt) : opt.charAt(0).toUpperCase() + opt.slice(1)}
        </button>
      ))}
    </div>
  )
}

const DISP_OPTS: FiltroDisp[] = ['todos', 'si', 'no']
const DISP_LABELS: Record<FiltroDisp, string> = { todos: 'Todos', si: '? Disponibles', no: '? No disponibles' }

interface Props {
  rows:              Producto[]
  filtroCategoria:   FiltroCategoria
  setFiltroCategoria:(v: string) => void
  filtroDisponible:  FiltroDisp
  setFiltroDisponible:(v: string) => void
  onToggle:          (id: string) => void
  onEdit:            (p: Producto) => void
  onDelete:          (p: Producto) => void
}

export function ProductsTable({ rows, filtroCategoria, setFiltroCategoria, filtroDisponible, setFiltroDisponible, onToggle, onEdit, onDelete }: Props) {
  const TH: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase',
    letterSpacing: '0.8px', padding: '11px 16px', textAlign: 'left',
  }
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
      {/* Card header */}
      <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Catalogo de productos</span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <TabGroup options={CATS} active={filtroCategoria} onSelect={setFiltroCategoria} labelFn={(v) => v === 'todos' ? 'Todos' : v} />
          <TabGroup options={DISP_OPTS} active={filtroDisponible} onSelect={setFiltroDisponible} labelFn={(v) => DISP_LABELS[v]} />
        </div>
      </div>

      {rows.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)' }}>
          <ShoppingBag size={28} style={{ margin: '0 auto 10px', opacity: 0.35 }} />
          <p style={{ fontSize: 14 }}>No se encontraron productos</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--bg)' }}>
              <tr>
                {['ID', 'Nombre', 'Categoria', 'Precio', 'Disponibilidad', 'Acciones'].map((h) => (
                  <th key={h} style={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((p, idx) => (
                <tr
                  key={p.prod_id}
                  style={{ borderBottom: idx < rows.length - 1 ? '1px solid var(--border)' : 'none', animation: 'fadeInRow 0.25s ease both', animationDelay: `${idx * 30}ms` }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 11.5, color: 'var(--muted)' }}>{p.prod_id}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--text)', fontSize: 14 }}>{p.nombre}</td>
                  <td style={{ padding: '12px 16px' }}><CategoriaBadge cat={p.categoria} /></td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
                      ${p.precio.toLocaleString('es-CO')}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>COP</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <ToggleSwitch checked={p.disponible} onChange={() => onToggle(p.prod_id)} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        title="Editar" onClick={() => onEdit(p)}
                        style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', transition: 'all 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--amber-bg)'; e.currentTarget.style.borderColor = 'var(--amber)'; e.currentTarget.style.color = 'var(--amber)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
                      ><Pencil size={14} /></button>
                      <button
                        title="Eliminar" onClick={() => onDelete(p)}
                        style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', transition: 'all 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--red-bg)'; e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
                      ><Trash2 size={14} /></button>
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
