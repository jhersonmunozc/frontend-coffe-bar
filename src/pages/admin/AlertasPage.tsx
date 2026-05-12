import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getHistorialAlertas } from '../../api/alertasApi'
import { Badge } from '../../components/ui/Badge'
import type { Alerta } from '../../types/cafesino.types'

type Filtro = 'Todos' | 'Bajo' | 'Agotado' | 'Critico'

const nivelBadge = (nivel: Alerta['nivel']): 'yellow' | 'red' | 'orange' => {
  if (nivel === 'Bajo')    return 'yellow'
  if (nivel === 'Agotado') return 'red'
  return 'orange'
}

const formatFecha = (iso: string) =>
  new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })

export default function AlertasPage() {
  const [filtro, setFiltro] = useState<Filtro>('Todos')

  const { data: alertas = [], isLoading } = useQuery({
    queryKey: ['historial-alertas'],
    queryFn: getHistorialAlertas,
    staleTime: 30_000,
  })

  const filtradas = filtro === 'Todos' ? alertas : alertas.filter((a) => a.nivel === filtro)

  const FILTROS: Filtro[] = ['Todos', 'Bajo', 'Agotado', 'Critico']

  return (
    <div className="max-w-6xl mx-auto">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="font-bold leading-none" style={{ fontSize: 28, color: '#1a1a2e', fontFamily: "'Playfair Display', serif" }}>
          Alertas
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#6b7280' }}>Historial completo de alertas de stock</p>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 mb-6">
        {FILTROS.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
            style={
              filtro === f
                ? { background: '#af4c0f', color: '#fff' }
                : { background: '#f3f4f6', color: '#6b7280' }
            }
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400">
          {filtradas.length} alerta{filtradas.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Cargando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                  {['Fecha', 'Ingrediente', 'Nivel', 'Mensaje', 'Visto'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 font-semibold uppercase tracking-wider" style={{ fontSize: 11, color: '#9ca3af' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtradas.map((a) => (
                  <tr key={a.alert_id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap text-xs">{formatFecha(a.fecha)}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-600">{a.ing_id}</td>
                    <td className="px-5 py-3.5"><Badge label={a.nivel} color={nivelBadge(a.nivel)} /></td>
                    <td className="px-5 py-3.5 text-gray-700">{a.msj}</td>
                    <td className="px-5 py-3.5">
                      <Badge label={a.visto ? 'Visto' : 'Pendiente'} color={a.visto ? 'green' : 'gray'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtradas.length === 0 && (
              <p className="text-center py-10 text-gray-400 text-sm">Sin alertas para el filtro seleccionado</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
