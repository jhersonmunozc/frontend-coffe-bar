import { useMemo } from 'react'
import { useIngredientes, getStatus } from './useIngredientes'
import { useProductos }               from './useProductos'
import { useAlertasContext }          from '../context/AlertasContext'
import type { Ingrediente }           from '../types/cafesino.types'

const SEED_PEDIDOS = 14
const SEED_TICKET  = 6500
const SEED_TOP     = { nombre: 'Americano', unidades: 14 }
const SEED_HORAS   = [1,3,5,4,8,12,10,7,9,14,11,6]
const HORAS_LABEL  = ['7am','8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm','6pm']
const SEED_RANKING_UNIDADES: Record<string, number> = {
  'Americano': 14, 'Latte': 10, 'Espresso': 8, 'Capuchino': 6, 'Waffle': 4,
}

function formatTiempo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60)       return `hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)        return `hace ${hrs} h`
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

  const stats = useMemo<DashboardStats>(() => {
    const criticos = ingredientes.filter((i) => getStatus(i) === 'crit')
    const bajos    = ingredientes.filter((i) => getStatus(i) === 'low')

    const ventasPorHora = HORAS_LABEL.map((hora, i) => ({ hora, pedidos: SEED_HORAS[i] }))

    const catCount: Record<string, number> = {}
    productos.forEach((p) => { catCount[p.categoria] = (catCount[p.categoria] ?? 0) + 1 })
    const total = productos.length || 1
    const distribucionCategorias = Object.entries(catCount)
      .map(([nombre, count]) => ({ nombre, porcentaje: Math.round((count / total) * 100) }))
      .sort((a, b) => b.porcentaje - a.porcentaje)

    const sorted = [...productos]
      .sort((a, b) => (SEED_RANKING_UNIDADES[b.nombre] ?? 0) - (SEED_RANKING_UNIDADES[a.nombre] ?? 0))
      .slice(0, 5)
    const maxU = sorted[0] ? (SEED_RANKING_UNIDADES[sorted[0].nombre] ?? 1) : 1
    const productosRanking: ProductoRanking[] = sorted.map((p) => {
      const u = SEED_RANKING_UNIDADES[p.nombre] ?? 0
      return { id: p.prod_id, nombre: p.nombre, categoria: p.categoria, precio: p.precio, unidades: u, porcentajeBarra: Math.round((u / maxU) * 100) }
    })

    // Alertas desde el contexto real (las 4 mas recientes)
    const recientes = [...alertas].sort((a, b) => (a.fecha < b.fecha ? 1 : -1)).slice(0, 4)
    const alertasRecientes: AlertaReciente[] = recientes.map((a) => ({
      tipo:    a.nivel === 'critico' ? 'crit' : a.nivel === 'agotado' ? 'warn' : 'warn',
      mensaje: a.mensaje,
      tiempo:  formatTiempo(a.fecha),
    }))

    return {
      ingresosHoy:          SEED_PEDIDOS * SEED_TICKET,
      pedidosHoy:           SEED_PEDIDOS,
      productoTop:          SEED_TOP,
      ingredientesCriticos: criticos,
      ingredientesBajos:    bajos,
      alertasTotales:       alertas.length,
      ticketPromedio:       SEED_TICKET,
      ventasPorHora,
      distribucionCategorias,
      productosRanking,
      alertasRecientes,
    }
  }, [ingredientes, productos, alertas])

  return { ...stats, isLoading: lIng || lProd }
}
