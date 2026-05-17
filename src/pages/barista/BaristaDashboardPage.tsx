import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DollarSign, ShoppingBag, BarChart2, Star,
  Plus, X, Trash2, Loader2, ChevronDown, ArrowRight,
} from 'lucide-react'
import { useAuthStore }                          from '../../store/authStore'
import { obtenerMenu }                           from '../../api/productosApi'
import { useQuery }                              from '@tanstack/react-query'
import { useMisVentasHoy, useRegistrarVenta, formatPeso, formatHora } from '../../hooks/useVentas'

/* ─── Estilos base ──────────────────────────────────────── */
const SURFACE: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
}
const INPUT: React.CSSProperties = {
  width: '100%', border: '1.5px solid var(--border)', borderRadius: 10,
  padding: '10px 13px', fontSize: 14, background: '#fff',
  color: 'var(--text)', outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box' as const,
}

/* ─── KPI Card ──────────────────────────────────────────── */
function KpiCard({ label, value, icon, color, delay = 0 }: {
  label: string; value: string; icon: React.ReactNode; color: string; delay?: number
}) {
  return (
    <div style={{
      ...SURFACE, padding: '20px 22px',
      borderTop: `3px solid ${color}`,
      animation: `fadeInUp 0.35s ease ${delay}s both`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
    </div>
  )
}

/* ─── Modal Registro de Venta ───────────────────────────── */
interface LineaVenta { prod_id: string; cantidad: number; precio: number; nombre: string }

function ModalRegistrarVenta({ onClose }: { onClose: () => void }) {
  const { data: menu } = useQuery({
    queryKey: ['menu-barista'],
    queryFn: obtenerMenu,
    staleTime: 60_000,
  })
  const mutRegistrar      = useRegistrarVenta()
  const [lineas, setLineas] = useState<LineaVenta[]>([])
  const [error, setError]   = useState('')

  const disponibles = menu?.disponibles ?? []
  const total       = lineas.reduce((s, l) => s + l.precio * l.cantidad, 0)

  const agregarLinea = () => {
    if (disponibles.length === 0) return
    const p = disponibles[0]
    setLineas(prev => [...prev, { prod_id: p.prod_id, precio: p.precio, nombre: p.nombre, cantidad: 1 }])
  }

  const cambiarProducto = (i: number, prod_id: string) => {
    const p = disponibles.find(x => x.prod_id === prod_id)
    if (!p) return
    setLineas(prev => prev.map((l, idx) => idx === i ? { ...l, prod_id, precio: p.precio, nombre: p.nombre } : l))
  }

  const cambiarCantidad = (i: number, val: string) => {
    const n = parseInt(val, 10)
    if (isNaN(n) || n < 1) return
    setLineas(prev => prev.map((l, idx) => idx === i ? { ...l, cantidad: Math.min(n, 99) } : l))
  }

  const confirmar = () => {
    setError('')
    if (lineas.length === 0) { setError('Agrega al menos un producto.'); return }
    mutRegistrar.mutate(
      {
        venta_id: crypto.randomUUID(),
        productos: lineas.map(l => ({ prod_id: l.prod_id, cantidad: l.cantidad })),
        total,
      },
      {
        onSuccess: onClose,
        onError: (err: any) => setError(err?.response?.data?.message ?? 'Error al registrar la venta'),
      }
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        ...SURFACE, padding: 28, width: 500, maxWidth: '94vw',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)', animation: 'fadeInUp 0.2s ease both',
      }} onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Registrar venta</h3>
            <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '3px 0 0' }}>Selecciona los productos vendidos</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Líneas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16, maxHeight: 260, overflowY: 'auto' }}>
          {lineas.length === 0 && (
            <div style={{ textAlign: 'center', padding: '18px 0', color: 'var(--muted)', fontSize: 13 }}>
              Ningún producto agregado aún
            </div>
          )}
          {lineas.map((l, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 90px auto', gap: 10, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <select
                  value={l.prod_id}
                  onChange={e => cambiarProducto(i, e.target.value)}
                  style={{ ...INPUT, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                >
                  {disponibles.map(p => (
                    <option key={p.prod_id} value={p.prod_id}>{p.nombre} — {formatPeso(p.precio)}</option>
                  ))}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={l.cantidad}
                onChange={e => cambiarCantidad(i, e.target.value)}
                style={{ ...INPUT, textAlign: 'center' }}
                placeholder="Cant."
              />
              <button onClick={() => setLineas(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 4 }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={agregarLinea}
          disabled={disponibles.length === 0}
          style={{
            width: '100%', padding: '9px 0', borderRadius: 9,
            border: '1.5px dashed var(--border)', background: 'none',
            color: 'var(--muted)', cursor: 'pointer', fontSize: 13.5,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 18,
          }}
        >
          <Plus size={14} /> Agregar producto
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderRadius: 10, background: 'var(--bg)',
          border: '1px solid var(--border)', marginBottom: 16,
        }}>
          <span style={{ fontSize: 14, color: 'var(--muted)' }}>Total a cobrar</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--cafe)' }}>{formatPeso(total)}</span>
        </div>

        {error && (
          <div style={{ fontSize: 12.5, color: 'var(--red)', background: 'var(--red-bg)', borderRadius: 8, padding: '8px 12px', marginBottom: 14 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '10px 20px', borderRadius: 10, border: '1.5px solid var(--border)',
            background: 'none', color: 'var(--text)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
          }}>
            Cancelar
          </button>
          <button
            onClick={confirmar}
            disabled={mutRegistrar.isPending || lineas.length === 0}
            style={{
              padding: '10px 24px', borderRadius: 10, border: 'none',
              background: 'var(--cafe)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              opacity: (mutRegistrar.isPending || lineas.length === 0) ? 0.65 : 1,
            }}
          >
            {mutRegistrar.isPending && <Loader2 size={15} style={{ animation: 'spin 0.7s linear infinite' }} />}
            Confirmar venta
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Página Dashboard ──────────────────────────────────── */
export default function BaristaDashboardPage() {
  const navigate               = useNavigate()
  const { usuario }            = useAuthStore()
  const [modal, setModal]      = useState(false)

  const { data: ventas = [], isLoading } = useMisVentasHoy()

  const kpis = useMemo(() => {
    const total    = ventas.reduce((s, v) => s + v.total, 0)
    const cantidad = ventas.length
    const promedio = cantidad > 0 ? Math.round(total / cantidad) : 0
    const topMap   = new Map<string, number>()
    ventas.forEach(v => v.productos.forEach(p => topMap.set(p.prod_id, (topMap.get(p.prod_id) ?? 0) + p.cantidad)))
    const [topId, topCant] = topMap.size > 0
      ? Array.from(topMap.entries()).sort((a, b) => b[1] - a[1])[0]
      : ['—', 0]
    return { total, cantidad, promedio, topId, topCant }
  }, [ventas])

  const ultimasVentas = ventas.slice(0, 5)
  const fechaHoy      = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{ padding: '28px 32px', background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Saludo */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
          Bienvenido, {usuario?.nombre.split(' ')[0]} 👋
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{fechaHoy}</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Mis ingresos hoy"     value={formatPeso(kpis.total)}    color="var(--cafe)"  delay={0}    icon={<DollarSign size={16} color="var(--cafe)" />} />
        <KpiCard label="Ventas registradas"   value={String(kpis.cantidad)}     color="var(--green)" delay={0.05} icon={<ShoppingBag size={16} color="var(--green)" />} />
        <KpiCard label="Promedio por venta"   value={formatPeso(kpis.promedio)} color="var(--amber)" delay={0.1}  icon={<BarChart2 size={16} color="var(--amber)" />} />
        <KpiCard
          label="Producto más vendido"
          value={kpis.topCant > 0 ? `${kpis.topId} ×${kpis.topCant}` : '—'}
          color="var(--red)"
          delay={0.15}
          icon={<Star size={16} color="var(--red)" />}
        />
      </div>

      {/* CTA Registrar venta */}
      <button
        onClick={() => setModal(true)}
        style={{
          width: '100%', padding: '16px 24px', borderRadius: 12, border: 'none',
          background: 'var(--cafe)', color: '#fff', fontSize: 15, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: '0 4px 16px rgba(200,90,18,0.25)',
          animation: 'fadeInUp 0.4s ease 0.2s both',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--cafe-dark)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--cafe)')}
      >
        <Plus size={18} /> Registrar nueva venta
      </button>

      {/* Últimas ventas */}
      <div style={{ ...SURFACE, overflow: 'hidden', animation: 'fadeInUp 0.4s ease 0.25s both' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
            Últimas ventas del día
            <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 400, marginLeft: 8 }}>
              {ventas.length} en total
            </span>
          </span>
          {ventas.length > 5 && (
            <button
              onClick={() => navigate('/barista/ventas')}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--cafe)', fontSize: 13, fontWeight: 500,
              }}
            >
              Ver todas <ArrowRight size={14} />
            </button>
          )}
        </div>

        {isLoading ? (
          <div style={{ padding: 36, textAlign: 'center', color: 'var(--muted)' }}>
            <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', marginBottom: 8 }} />
            <p style={{ margin: 0, fontSize: 13 }}>Cargando…</p>
          </div>
        ) : ultimasVentas.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
            <ShoppingBag size={30} style={{ marginBottom: 10, opacity: 0.3 }} />
            <p style={{ margin: 0, fontSize: 13 }}>Aún no hay ventas registradas hoy</p>
            <p style={{ margin: '5px 0 0', fontSize: 12 }}>Usa el botón de arriba para comenzar</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg)' }}>
                  {['Hora', 'Productos', 'Ítems', 'Total'].map(h => (
                    <th key={h} style={{
                      padding: '10px 20px', textAlign: 'left',
                      fontSize: 11.5, fontWeight: 600, color: 'var(--muted)',
                      letterSpacing: '0.5px', textTransform: 'uppercase',
                      borderBottom: '1px solid var(--border)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ultimasVentas.map((v, i) => (
                  <tr
                    key={v.venta_id}
                    style={{ borderBottom: '1px solid var(--border)', animation: `fadeInUp 0.2s ease ${i * 0.04}s both` }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 20px', fontSize: 13.5, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                      {formatHora(v.fecha)}
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: 13.5, color: 'var(--text)' }}>
                      {v.productos.map(p => `${p.prod_id} ×${p.cantidad}`).join(', ')}
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--muted)' }}>
                      {v.productos.reduce((s, p) => s + p.cantidad, 0)}
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: 14, fontWeight: 600, color: 'var(--cafe)', whiteSpace: 'nowrap' }}>
                      {formatPeso(v.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && <ModalRegistrarVenta onClose={() => setModal(false)} />}
    </div>
  )
}
