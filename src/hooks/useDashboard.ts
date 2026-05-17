import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useIngredientes, getStatus } from './useIngredientes'
import { useProductos }               from './useProductos'
import { useAlertasContext }          from '../context/AlertasContext'
import { getVentas }                  from '../api/ventasApi'
import type { Ingrediente }           from '../types/cafesino.types'

const HORAS_LABEL = ['7am','8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm','6pm']

function formatTiempo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60)  return `hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `hace ${hrs} h`
  return `hace ${Math.floor(hrs / 24)} d`
}

export interface AlertaReciente {
  tipo:    'crit' | 'warn' | 'info'
  mensaje: string
  tiempo:  string
}

export interface ProductoRanking {
  id: string; nombre: string; categoria: string
  precio: number; unidades: number; porcentajeBarra: number
}

export interface DashboardStats {
  ingresosHoy:    number
  pedidosHoy:     number
  productoTop:    { nombre: string; unidades: number }
  ingredientesCriticos: Ingrediente[]
  ingredientesBajos:    Ingrediente[]
  alertasTotales: number
  ticketPromedio: number
  ventasPorHora:  { hora: string; pedidos: number }[]
  distribucionCategorias: { nombre: string; porcentaje: number }[]
  productosRanking:       ProductoRanking[]
  alertasRecientes:       AlertaReciente[]
}

export function useDashboard(): DashboardStats & { isLoading: boolean } {
  const { ingredientes, isLoading: lIng }  = useIngredientes()
  const { productos,    isLoading: lProd } = useProductos()
  const { alertas }                        = useAlertasContext()

  const hoy = new Date().toISOString().split('T')[0]
  const { data: ventas = [], isLoading: lVentas } = useQuery({
    queryKey: ['ventas-dashboard', hoy],
    queryFn:  () => getVentas({ fecha_inicio: hoy, fecha_fin: hoy }),
    staleTime: 30_000,
    refetchInterval: 30_000,
  })

  const stats = useMemo<DashboardStats>(() => {
    const criticos = ingredientes.filter((i) => getStatus(i) === 'crit')
    const bajos    = ingredientes.filter((i) => getStatus(i) === 'low')

    /* ── KPIs de ventas reales ── */
    const ingresosHoy   = ventas.reduce((s, v) => s + v.total, 0)
    const pedidosHoy    = ventas.length
    const ticketPromedio = pedidosHoy > 0 ? Math.round(ingresosHoy / pedidosHoy) : 0

    /* ── Ventas por hora (7am–6pm = 12 franjas) ── */
    const horaMap = Array(12).fill(0)
    ventas.forEach((v) => {
      const h = new Date(v.fecha).getHours()
      const idx = h - 7
      if (idx >= 0 && idx < 12) horaMap[idx]++
    })
    const ventasPorHora = HORAS_LABEL.map((hora, i) => ({ hora, pedidos: horaMap[i] }))

    /* ── Top productos por unidades ── */
    const topMap = new Map<string, number>()
    ventas.forEach((v) => v.productos.forEach((p) => {
      topMap.set(p.prod_id, (topMap.get(p.prod_id) ?? 0) + p.cantidad)
    }))
    const topArray = Array.from(topMap.entries()).sort((a, b) => b[1] - a[1])

    const topEntry  = topArray[0]
    const topProd   = topEntry ? productos.find((p) => p.prod_id === topEntry[0]) : null
    const productoTop = {
      nombre:   topProd?.nombre ?? (topEntry?.[0] ?? '—'),
      unidades: topEntry?.[1] ?? 0,
    }

    /* ── Ranking top 5 ── */
    const top5 = topArray.slice(0, 5)
    const maxU = top5[0]?.[1] ?? 1
    const productosRanking: ProductoRanking[] = top5.map(([prod_id, unidades]) => {
      const prod = productos.find((p) => p.prod_id === prod_id)
      return {
        id:           prod_id,
        nombre:       prod?.nombre   ?? prod_id,
        categoria:    prod?.categoria ?? '—',
        precio:       prod?.precio    ?? 0,
        unidades,
        porcentajeBarra: Math.round((unidades / maxU) * 100),
      }
    })

    /* ── Distribución por categoría (basada en ventas; fallback catálogo) ── */
    const catMap = new Map<string, number>()
    ventas.forEach((v) => v.productos.forEach((p) => {
      const prod = productos.find((x) => x.prod_id === p.prod_id)
      if (prod) catMap.set(prod.categoria, (catMap.get(prod.categoria) ?? 0) + p.cantidad)
    }))
    const totalCatVentas = Array.from(catMap.values()).reduce((s, c) => s + c, 0)

    const distribucionCategorias = totalCatVentas > 0
      ? Array.from(catMap.entries())
          .map(([nombre, count]) => ({ nombre, porcentaje: Math.round((count / totalCatVentas) * 100) }))
          .sort((a, b) => b.porcentaje - a.porcentaje)
      : (() => {
          const cc: Record<string, number> = {}
          productos.forEach((p) => { cc[p.categoria] = (cc[p.categoria] ?? 0) + 1 })
          const tot = productos.length || 1
          return Object.entries(cc)
            .map(([nombre, count]) => ({ nombre, porcentaje: Math.round((count / tot) * 100) }))
            .sort((a, b) => b.porcentaje - a.porcentaje)
        })()

    /* ── Alertas recientes ── */
    const recientes = [...alertas].sort((a, b) => (a.fecha < b.fecha ? 1 : -1)).slice(0, 4)
    const alertasRecientes: AlertaReciente[] = recientes.map((a) => ({
      tipo:    a.nivel === 'critico' ? 'crit' : 'warn',
      mensaje: a.mensaje,
      tiempo:  formatTiempo(a.fecha),
    }))

    return {
      ingresosHoy,
      pedidosHoy,
      productoTop,
      ingredientesCriticos: criticos,
      ingredientesBajos:    bajos,
      alertasTotales:       alertas.length,
      ticketPromedio,
      ventasPorHora,
      distribucionCategorias,
      productosRanking,
      alertasRecientes,
    }
  }, [ventas, ingredientes, productos, alertas])

  return { ...stats, isLoading: lIng || lProd || lVentas }
}
