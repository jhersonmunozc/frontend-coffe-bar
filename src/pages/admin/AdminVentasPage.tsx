import { useState, useMemo } from 'react'
import {
  DollarSign, ShoppingBag, BarChart2, Download,
  RefreshCw, Loader2, TrendingUp,
} from 'lucide-react'
import { Topbar }       from '../../components/layout/Topbar'
import { useVentas, formatPeso, formatHora, formatFecha } from '../../hooks/useVentas'
import { useUsuarios }  from '../../hooks/useUsuarios'
import { useProductos } from '../../hooks/useProductos'

/* ─── Estilos base ──────────────────────────────────────── */
const SURFACE: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
}
const SELECT: React.CSSProperties = {
  border: '1.5px solid var(--border)', borderRadius: 9, padding: '8px 12px',
  fontSize: 13.5, background: '#fff', color: 'var(--text)', outline: 'none',
  fontFamily: 'inherit', cursor: 'pointer',
}

/* ─── KPI Card ──────────────────────────────────────────── */
function KpiCard({ label, value, icon, color, delay = 0 }: {
  label: string; value: string; icon: React.ReactNode; color: string; delay?: number
}) {
  return (
    <div style={{ ...SURFACE, padding: '20px 22px', borderTop: `3px solid ${color}`, animation: `fadeInUp 0.35s ease ${delay}s both` }}>
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

/* ─── Página principal ──────────────────────────────────── */
export default function AdminVentasPage() {
  /* Filtros */
  const hoy = new Date().toISOString().split('T')[0]
  const [fechaInicio, setFechaInicio] = useState(hoy)
  const [fechaFin,    setFechaFin]    = useState(hoy)
  const [baristaId,   setBaristaId]   = useState('')
  const [pagina,      setPagina]      = useState(1)
  const POR_PAG = 15

  const filtros = useMemo(() => ({
    fecha_inicio: fechaInicio || undefined,
    fecha_fin:    fechaFin    || undefined,
    barista_id:   baristaId   || undefined,
  }), [fechaInicio, fechaFin, baristaId])

  /* Data */
  const { ventas, stats, topProductos, ingresosPorBarista, isLoading, isError, refetch, exportCSV } = useVentas(filtros)
  const { usuarios }  = useUsuarios()
  const { productos } = useProductos()
  const baristas      = usuarios.filter(u => u.rol === 'Barista')

  /* Lookup helpers */
  const nombreBarista = (id: string) => usuarios.find(u => u.usuario_id === id)?.nombre ?? id
  const nombreProd    = (id: string) => productos.find(p => p.prod_id === id)?.nombre ?? id

  /* Paginación */
  const totalPags  = Math.max(1, Math.ceil(ventas.length / POR_PAG))
  const ventasPag  = ventas.slice((pagina - 1) * POR_PAG, pagina * POR_PAG)

  const aplicarFiltros = () => { setPagina(1); refetch() }

  return (
    <div style={{ padding: '28px 32px', background: 'var(--bg)', minHeight: '100vh' }}>
      <Topbar
        title="Ventas"
        subtitle="Análisis y detalle de todas las ventas del negocio"
        onExportar={() => exportCSV(productos.map(p => ({ prod_id: p.prod_id, nombre: p.nombre })))}
      />

      {/* Filtros */}
      <div style={{ ...SURFACE, padding: '18px 22px', marginBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Desde
            </label>
            <input
              type="date"
              value={fechaInicio}
              max={fechaFin || hoy}
              onChange={e => { setFechaInicio(e.target.value); setPagina(1) }}
              style={{ ...SELECT }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Hasta
            </label>
            <input
              type="date"
              value={fechaFin}
              min={fechaInicio}
              max={hoy}
              onChange={e => { setFechaFin(e.target.value); setPagina(1) }}
              style={{ ...SELECT }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Barista
            </label>
            <select value={baristaId} onChange={e => { setBaristaId(e.target.value); setPagina(1) }} style={SELECT}>
              <option value="">Todos</option>
              {baristas.map(b => <option key={b.usuario_id} value={b.usuario_id}>{b.nombre}</option>)}
            </select>
          </div>
          <button
            onClick={aplicarFiltros}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
              borderRadius: 9, border: '1.5px solid var(--border)', background: 'none',
              color: 'var(--text)', fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Total ingresos"    value={formatPeso(stats.total)}    color="var(--cafe)"  delay={0}    icon={<DollarSign size={16} color="var(--cafe)" />} />
        <KpiCard label="Ventas realizadas" value={String(stats.cantidad)}     color="var(--green)" delay={0.05} icon={<ShoppingBag size={16} color="var(--green)" />} />
        <KpiCard label="Promedio por venta" value={formatPeso(stats.promedio)} color="var(--amber)" delay={0.1}  icon={<BarChart2 size={16} color="var(--amber)" />} />
      </div>

      {isLoading ? (
        <div style={{ ...SURFACE, padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
          <Loader2 size={28} style={{ animation: 'spin 0.8s linear infinite', marginBottom: 10 }} />
          <p style={{ margin: 0 }}>Cargando ventas…</p>
        </div>
      ) : isError ? (
        <div style={{ ...SURFACE, padding: 48, textAlign: 'center', color: 'var(--red)' }}>
          Error al cargar ventas. Verifica la conexión con el servidor.
        </div>
      ) : (
        <>
          {/* Top 3 productos + Ingresos por barista */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

            {/* Top Productos */}
            <div style={{ ...SURFACE, padding: '18px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <TrendingUp size={16} color="var(--cafe)" />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Top 3 productos</span>
              </div>
              {topProductos.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>Sin datos en el período</p>
              ) : topProductos.map((p, i) => (
                <div key={p.prod_id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0', borderBottom: i < topProductos.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: i === 0 ? 'var(--amber-bg)' : 'var(--bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: i === 0 ? 'var(--amber)' : 'var(--muted)',
                  }}>
                    #{i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {nombreProd(p.prod_id)}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.prod_id}</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--cafe)', flexShrink: 0 }}>
                    ×{p.cantidad}
                  </span>
                </div>
              ))}
            </div>

            {/* Ingresos por barista */}
            <div style={{ ...SURFACE, padding: '18px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <ShoppingBag size={16} color="var(--green)" />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Ingresos por barista</span>
              </div>
              {ingresosPorBarista.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>Sin datos en el período</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr>
                      {['Barista', 'Ingresos', 'Ventas', 'Promedio'].map(h => (
                        <th key={h} style={{
                          textAlign: 'left', padding: '6px 8px', fontSize: 11,
                          color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.5px',
                          textTransform: 'uppercase', borderBottom: '1px solid var(--border)',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ingresosPorBarista.map(b => (
                      <tr key={b.barista_id}>
                        <td style={{ padding: '9px 8px', color: 'var(--text)', fontWeight: 500 }}>
                          {nombreBarista(b.barista_id)}
                        </td>
                        <td style={{ padding: '9px 8px', color: 'var(--cafe)', fontWeight: 600 }}>
                          {formatPeso(b.total)}
                        </td>
                        <td style={{ padding: '9px 8px', color: 'var(--muted)' }}>{b.cantidad}</td>
                        <td style={{ padding: '9px 8px', color: 'var(--muted)' }}>{formatPeso(b.promedio)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Tabla detallada */}
          <div style={{ ...SURFACE, overflow: 'hidden' }}>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
                Detalle de ventas
                <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 400, marginLeft: 8 }}>
                  {ventas.length} resultado{ventas.length !== 1 ? 's' : ''}
                </span>
              </span>
              <button
                onClick={() => exportCSV(productos.map(p => ({ prod_id: p.prod_id, nombre: p.nombre })))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                  borderRadius: 8, border: '1.5px solid var(--border)', background: 'none',
                  color: 'var(--muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <Download size={13} /> CSV
              </button>
            </div>

            {ventas.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
                <ShoppingBag size={34} style={{ marginBottom: 10, opacity: 0.3 }} />
                <p style={{ margin: 0, fontSize: 13 }}>No hay ventas en el período seleccionado</p>
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg)' }}>
                        {['Hora', 'Fecha', 'Barista', 'Productos', 'Total'].map(h => (
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
                      {ventasPag.map((v, i) => (
                        <tr
                          key={v.venta_id}
                          style={{
                            borderBottom: '1px solid var(--border)',
                            animation: `fadeInUp 0.2s ease ${i * 0.03}s both`,
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <td style={{ padding: '12px 20px', fontSize: 13.5, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                            {formatHora(v.fecha)}
                          </td>
                          <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                            {formatFecha(v.fecha)}
                          </td>
                          <td style={{ padding: '12px 20px', fontSize: 13.5, color: 'var(--text)', fontWeight: 500 }}>
                            {nombreBarista(v.barista_id)}
                          </td>
                          <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--muted)' }}>
                            {v.productos.map(p => `${nombreProd(p.prod_id)} ×${p.cantidad}`).join(', ')}
                          </td>
                          <td style={{ padding: '12px 20px', fontSize: 14, fontWeight: 600, color: 'var(--cafe)', whiteSpace: 'nowrap' }}>
                            {formatPeso(v.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {totalPags > 1 && (
                  <div style={{
                    padding: '14px 22px', borderTop: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                      Página {pagina} de {totalPags} · {ventas.length} ventas
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => setPagina(p => Math.max(1, p - 1))}
                        disabled={pagina === 1}
                        style={{
                          padding: '6px 14px', borderRadius: 8, border: '1.5px solid var(--border)',
                          background: 'none', cursor: pagina === 1 ? 'not-allowed' : 'pointer',
                          fontSize: 13, color: pagina === 1 ? 'var(--border)' : 'var(--text)',
                        }}
                      >
                        ← Anterior
                      </button>
                      <button
                        onClick={() => setPagina(p => Math.min(totalPags, p + 1))}
                        disabled={pagina === totalPags}
                        style={{
                          padding: '6px 14px', borderRadius: 8, border: '1.5px solid var(--border)',
                          background: 'none', cursor: pagina === totalPags ? 'not-allowed' : 'pointer',
                          fontSize: 13, color: pagina === totalPags ? 'var(--border)' : 'var(--text)',
                        }}
                      >
                        Siguiente →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
