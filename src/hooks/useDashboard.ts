import { useMemo } from 'react'
import { useIngredientes, getStatus } from './useIngredientes'
import { useProductos }               from './useProductos'
import type { Ingrediente }           from '../types/cafesino.types'

const SEED_PEDIDOS = 14
const SEED_TICKET  = 6500
const SEED_TOP     = { nombre: 'Americano', unidades: 14 }
const SEED_HORAS   = [1,3,5,4,8,12,10,7,9,14,11,6]
const HORAS_LABEL  = ['7am','8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm','6pm']
const SEED_RANKING_UNIDADES: Record<string, number> = {
  'Americano': 14, 'Latte': 10, 'Espresso': 8, 'Capuchino': 6, 'Waffle': 4,
}

export interface AlertaReciente {
  tipo: 'crit' | 'warn' | 'info'
  mensaje: string
  tiempo: string
}

export interface ProductoRanking {
  id: string; nombre: string; categoria: string
  precio: number; unidades: number; porcentajeBarra: number
}

export interface DashboardStats {
  ingresosHoy: number
  pedidosHoy: number
  productoTop: { nombre: string; unidades: number }
  ingredientesCriticos: Ingrediente[]
  ingredientesBajos: Ingrediente[]
  alertasTotales: number
  ticketPromedio: number
  ventasPorHora: { hora: string; pedidos: number }[]
  distribucionCategorias: { nombre: string; porcentaje: number }[]
  productosRanking: ProductoRanking[]
  alertasRecientes: AlertaReciente[]
}

export function useDashboard(): DashboardStats & { isLoading: boolean } {
  const { ingredientes, isLoading: lIng } = useIngredientes()
  const { productos, isLoading: lProd }   = useProductos()

  const stats = useMemo<DashboardStats>(() => {
    const criticos = ingredientes.filter((i) => getStatus(i) === 'crit')
    const bajos    = ingredientes.filter((i) => getStatus(i) === 'low')

    // Ventas por hora
    const ventasPorHora = HORAS_LABEL.map((hora, i) => ({ hora, pedidos: SEED_HORAS[i] }))

    // Distribucion por categoria
    const catCount: Record<string, number> = {}
    productos.forEach((p) => { catCount[p.categoria] = (catCount[p.categoria] ?? 0) + 1 })
    const total = productos.length || 1
    const distribucionCategorias = Object.entries(catCount)
      .map(([nombre, count]) => ({ nombre, porcentaje: Math.round((count / total) * 100) }))
      .sort((a, b) => b.porcentaje - a.porcentaje)

    // Ranking top 5
    const sorted = [...productos]
      .sort((a, b) => {
        const ua = SEED_RANKING_UNIDADES[a.nombre] ?? 0
        const ub = SEED_RANKING_UNIDADES[b.nombre] ?? 0
        return ub - ua
      })
      .slice(0, 5)
    const maxU = sorted[0] ? (SEED_RANKING_UNIDADES[sorted[0].nombre] ?? 1) : 1
    const productosRanking: ProductoRanking[] = sorted.map((p) => {
      const u = SEED_RANKING_UNIDADES[p.nombre] ?? 0
      return { id: p.prod_id, nombre: p.nombre, categoria: p.categoria, precio: p.precio, unidades: u, porcentajeBarra: Math.round((u / maxU) * 100) }
    })

    // Alertas recientes seed
    const alertasRecientes: AlertaReciente[] = [
      { tipo: 'crit', mensaje: criticos.length > 0 ? `${criticos[0].nombre}: stock cr?tico (${criticos[0].stock} ${criticos[0].u_medida})` : 'Sin ingredientes cr?ticos', tiempo: 'hace 20 min' },
      { tipo: 'warn', mensaje: bajos.length > 0 ? `${bajos[0].nombre}: stock bajo` : 'Stock estable', tiempo: 'hace 1 h' },
      { tipo: 'warn', mensaje: 'Cappuccino: disponibilidad limitada', tiempo: 'hace 3 h' },
      { tipo: 'info', mensaje: 'Nuevo producto agregado al cat?logo', tiempo: 'hace 1 d' },
    ]

    const ingresosHoy = SEED_PEDIDOS * SEED_TICKET

    return {
      ingresosHoy,
      pedidosHoy:     SEED_PEDIDOS,
      productoTop:    SEED_TOP,
      ingredientesCriticos: criticos,
      ingredientesBajos:    bajos,
      alertasTotales: criticos.length + bajos.length + 2,
      ticketPromedio: SEED_TICKET,
      ventasPorHora,
      distribucionCategorias,
      productosRanking,
      alertasRecientes,
    }
  }, [ingredientes, productos])

  return { ...stats, isLoading: lIng || lProd }
}
