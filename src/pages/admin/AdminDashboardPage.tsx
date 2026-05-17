import { TrendingUp, ShoppingBag, AlertTriangle, Coffee, BarChart2, Bell } from 'lucide-react'
import { Topbar }        from '../../components/layout/Topbar'
import { useDashboard }  from '../../hooks/useDashboard'

/* ── helpers de estilo ─────────────────────────── */
const card: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 16, padding: '20px 22px',
}

/* ── KPI card ──────────────────────────────────── */
interface KpiProps {
  label: string; value: string; sub: string
  icon: React.ReactNode; accentColor: string; bgColor: string
}
function KpiCard({ label, value, sub, icon, accentColor, bgColor }: KpiProps) {
  return (
    <div style={{ ...card, display: 'flex', alignItems: 'flex-start', gap: 16, borderLeft: `3px solid ${accentColor}` }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: accentColor }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.9px', margin: 0 }}>{label}</p>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: 'var(--text)', margin: '3px 0 2px', lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>{sub}</p>
      </div>
    </div>
  )
}

/* ── barra de grafico ──────────────────────────── */
function BarraHora({ hora, pedidos, maxVal }: { hora: string; pedidos: number; maxVal: number }) {
  const pct = maxVal > 0 ? (pedidos / maxVal) * 100 : 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)' }}>{pedidos > 0 ? pedidos : ''}</span>
      <div style={{ width: '100%', height: 90, background: 'var(--bg)', borderRadius: 6, display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
        <div style={{ width: '100%', height: `${pct}%`, background: 'var(--cafe)', borderRadius: '4px 4px 0 0', minHeight: pedidos > 0 ? 4 : 0, transition: 'height 0.4s ease' }} />
      </div>
      <span style={{ fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{hora}</span>
    </div>
  )
}

/* ── badge tipo alerta ─────────────────────────── */
const ALERTA_CFG = {
  crit: { bg: 'var(--red-bg)',   color: 'var(--red)',   label: 'Critico' },
  warn: { bg: 'var(--amber-bg)', color: 'var(--amber)', label: 'Aviso'   },
  info: { bg: 'var(--green-bg)', color: 'var(--green)', label: 'Info'    },
} as const

/* ═══════════════════════════════════════════════ */
export default function AdminDashboardPage() {
  const {
    ingresosHoy, pedidosHoy, productoTop, ticketPromedio,
    ingredientesCriticos, alertasTotales,
    ventasPorHora, distribucionCategorias,
    productosRanking, alertasRecientes,
    isLoading,
  } = useDashboard()

  const maxPedidos = Math.max(...ventasPorHora.map((v) => v.pedidos), 1)

  /* skeleton genérico */
  const Sk = ({ h = 20, w = '100%' }: { h?: number; w?: string | number }) => (
    <div style={{ height: h, width: w, background: 'var(--border)', borderRadius: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
  )

  return (
    <div style={{ padding: 32, background: 'var(--bg)', minHeight: '100vh' }}>
      <Topbar title="Dashboard" subtitle="Resumen del dia en tiempo real" />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <KpiCard
          label="Ingresos hoy"
          value={isLoading ? '…' : `$${ingresosHoy.toLocaleString('es-CO')}`}
          sub={isLoading ? '' : `${pedidosHoy} pedidos registrados`}
          icon={<TrendingUp size={20} />}
          accentColor="var(--cafe)"
          bgColor="rgba(175,76,15,0.10)"
        />
        <KpiCard
          label="Ticket promedio"
          value={isLoading ? '…' : `$${ticketPromedio.toLocaleString('es-CO')}`}
          sub="Por pedido"
          icon={<Coffee size={20} />}
          accentColor="var(--amber)"
          bgColor="var(--amber-bg)"
        />
        <KpiCard
          label="Producto top"
          value={isLoading ? '…' : productoTop.nombre}
          sub={isLoading ? '' : `${productoTop.unidades} unidades vendidas`}
          icon={<ShoppingBag size={20} />}
          accentColor="var(--green)"
          bgColor="var(--green-bg)"
        />
        <KpiCard
          label="Alertas activas"
          value={isLoading ? '…' : String(alertasTotales)}
          sub={ingredientesCriticos.length > 0 ? `${ingredientesCriticos.length} ingrediente(s) critico(s)` : 'Sin criticos'}
          icon={<AlertTriangle size={20} />}
          accentColor={ingredientesCriticos.length > 0 ? 'var(--red)' : 'var(--muted)'}
          bgColor={ingredientesCriticos.length > 0 ? 'var(--red-bg)' : 'var(--bg)'}
        />
      </div>

      {/* Fila media: grafico + distribucion */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* Ventas por hora */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <BarChart2 size={16} style={{ color: 'var(--cafe)' }} />
            <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>Pedidos por hora</span>
            <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--muted)' }}>Hoy · 7 am – 6 pm</span>
          </div>
          {isLoading ? (
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 110 }}>
              {Array.from({ length: 12 }).map((_, i) => <Sk key={i} h={Math.random() * 70 + 20} w={`${100 / 12}%`} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
              {ventasPorHora.map((v) => <BarraHora key={v.hora} hora={v.hora} pedidos={v.pedidos} maxVal={maxPedidos} />)}
            </div>
          )}
        </div>

        {/* Distribucion categorias */}
        <div style={card}>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', marginBottom: 18, marginTop: 0 }}>Categorias</p>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[80, 60].map((w, i) => <Sk key={i} h={36} w={`${w}%`} />)}
            </div>
          ) : distribucionCategorias.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Sin datos</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {distribucionCategorias.map((cat) => (
                <div key={cat.nombre}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{cat.nombre}</span>
                    <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>{cat.porcentaje}%</span>
                  </div>
                  <div style={{ height: 7, background: 'var(--bg)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${cat.porcentaje}%`, background: 'var(--cafe)', borderRadius: 99, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fila inferior: ranking + alertas */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }}>

        {/* Ranking productos */}
        <div style={card}>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', marginBottom: 16, marginTop: 0 }}>Top productos vendidos</p>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map((i) => <Sk key={i} h={40} />)}
            </div>
          ) : productosRanking.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Sin datos de ventas</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {productosRanking.map((p, idx) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: idx === 0 ? 'var(--cafe)' : 'var(--muted)', width: 18, textAlign: 'center', flexShrink: 0 }}>
                    {idx + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</span>
                      <span style={{ fontSize: 12, color: 'var(--muted)', flexShrink: 0, marginLeft: 8 }}>{p.unidades} u.</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--bg)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${p.porcentajeBarra}%`, background: idx === 0 ? 'var(--cafe)' : 'var(--border)', borderRadius: 99, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--muted)', flexShrink: 0, fontFamily: 'monospace' }}>
                    ${p.precio.toLocaleString('es-CO')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alertas recientes */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Bell size={15} style={{ color: 'var(--amber)' }} />
            <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>Alertas recientes</span>
          </div>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2,3,4].map((i) => <Sk key={i} h={48} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {alertasRecientes.map((a, i) => {
                const cfg = ALERTA_CFG[a.tipo]
                return (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, background: cfg.bg, color: cfg.color, borderRadius: 5, padding: '2px 7px', flexShrink: 0, alignSelf: 'flex-start', marginTop: 1 }}>
                      {cfg.label}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12.5, color: 'var(--text)', margin: 0, lineHeight: 1.4 }}>{a.mensaje}</p>
                      <p style={{ fontSize: 11, color: 'var(--muted)', margin: '2px 0 0' }}>{a.tiempo}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
