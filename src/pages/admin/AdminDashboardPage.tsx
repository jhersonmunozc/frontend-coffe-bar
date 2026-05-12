import { useQuery } from '@tanstack/react-query'
import {
  DollarSign,
  Star,
  AlertTriangle,
  Bell,
} from 'lucide-react'
import { getReporteDiario }    from '../../api/ventasApi'
import { getCriticos }         from '../../api/ingredientesApi'
import { getHistorialAlertas } from '../../api/alertasApi'
import { getTopVendido }       from '../../api/productosApi'

interface KpiCardProps {
  title: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  color: string
  loading?: boolean
}

function KpiCard({ title, value, sub, icon, color, loading }: KpiCardProps) {
  return (
    <div
      className="bg-white rounded-2xl shadow flex flex-col items-center text-center"
      style={{ padding: '36px 28px 28px', borderTop: `4px solid ${color}` }}
    >
      {/* Icono */}
      <div
        className="flex items-center justify-center rounded-full mb-5"
        style={{ width: 64, height: 64, background: color + '18' }}
      >
        <span style={{ color }}>{icon}</span>
      </div>

      {/* Valor */}
      {loading ? (
        <div className="h-10 w-32 rounded-lg animate-pulse bg-gray-200 mb-2" />
      ) : (
        <p
          className="font-extrabold leading-none mb-2"
          style={{ fontSize: 36, color: '#1a1a2e', fontFamily: "'Playfair Display', serif" }}
        >
          {value}
        </p>
      )}

      {/* Titulo */}
      <p
        className="font-semibold uppercase tracking-widest mb-1"
        style={{ fontSize: 11, color: '#9ca3af', letterSpacing: '0.12em' }}
      >
        {title}
      </p>

      {/* Subtitulo */}
      {sub && !loading && (
        <p className="text-sm mt-1" style={{ color: '#6b7280' }}>{sub}</p>
      )}
    </div>
  )
}

export default function AdminDashboardPage() {
  const { data: reporte,  isLoading: lReporte  } = useQuery({ queryKey: ['reporte-diario'],   queryFn: getReporteDiario,    staleTime: 60_000 })
  const { data: criticos, isLoading: lCriticos } = useQuery({ queryKey: ['criticos'],          queryFn: getCriticos,         staleTime: 60_000 })
  const { data: alertas,  isLoading: lAlertas  } = useQuery({ queryKey: ['historial-alertas'], queryFn: getHistorialAlertas, staleTime: 60_000 })
  const { data: top,      isLoading: lTop      } = useQuery({ queryKey: ['top-vendido'],       queryFn: getTopVendido,       staleTime: 60_000 })

  const totalDia       = reporte?.totalDia ?? 0
  const ingredCriticos = criticos?.length  ?? 0
  const totalAlertas   = alertas?.length   ?? 0
  const topNombre      = top?.nombre ?? '?'

  return (
    <div className="max-w-7xl mx-auto">

      {/* Encabezado */}
      <div className="mb-14 text-center">
        <h1
          className="font-bold leading-none"
          style={{ fontSize: 34, color: '#1a1a2e', fontFamily: "'Playfair Display', serif" }}
        >
          Dashboard
        </h1>
        <p className="mt-3 text-base" style={{ color: '#6b7280' }}>
          Resumen del dia en tiempo real
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <KpiCard
          title="Ingresos del dia"
          value={`$${totalDia.toLocaleString('es-CO')}`}
          sub="Ventas registradas hoy"
          icon={<DollarSign size={28} />}
          color="#af4c0f"
          loading={lReporte}
        />
        <KpiCard
          title="Producto top"
          value={topNombre}
          sub={top ? `${top.totalVendido} unidades vendidas` : undefined}
          icon={<Star size={28} />}
          color="#C4956A"
          loading={lTop}
        />
        <KpiCard
          title="Ingredientes criticos"
          value={ingredCriticos}
          sub={ingredCriticos === 0 ? 'Stock en orden' : 'Requieren atencion'}
          icon={<AlertTriangle size={28} />}
          color={ingredCriticos > 0 ? '#DC2626' : '#16A34A'}
          loading={lCriticos}
        />
        <KpiCard
          title="Alertas totales"
          value={totalAlertas}
          sub="Historial de alertas"
          icon={<Bell size={28} />}
          color="#F59E0B"
          loading={lAlertas}
        />
      </div>

      {/* Tabla criticos */}
      {!lCriticos && criticos && criticos.length > 0 && (
        <section className="bg-white rounded-2xl shadow p-6">
          <h2
            className="font-semibold mb-5 uppercase tracking-wider"
            style={{ fontSize: 13, color: '#374151', letterSpacing: '0.1em' }}
          >
            Ingredientes criticos
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                  {['Ingrediente', 'Stock actual', 'Unidad', 'Minimo'].map((h) => (
                    <th
                      key={h}
                      className="text-left pb-3 pr-6 font-semibold uppercase tracking-wider"
                      style={{ fontSize: 11, color: '#9ca3af' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {criticos.map((ing) => (
                  <tr key={ing._id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td className="py-3.5 pr-6 font-semibold" style={{ color: '#111827' }}>{ing.nombre}</td>
                    <td className="py-3.5 pr-6 font-bold" style={{ color: '#DC2626' }}>{ing.stock}</td>
                    <td className="py-3.5 pr-6" style={{ color: '#6b7280' }}>{ing.u_medida}</td>
                    <td className="py-3.5" style={{ color: '#6b7280' }}>{ing.minimo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
