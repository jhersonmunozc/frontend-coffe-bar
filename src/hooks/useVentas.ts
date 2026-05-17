import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getMisVentas, getVentas, registrarVenta,
  type FiltrosVentas,
} from '../api/ventasApi'
import type { Venta } from '../types/cafesino.types'

/* Hook para el Barista: sus propias ventas del día */
export function useMisVentasHoy() {
  const hoy = new Date().toISOString().split('T')[0]
  return useQuery({
    queryKey: ['mis-ventas', hoy],
    queryFn: () => getMisVentas({ fecha_inicio: hoy, fecha_fin: hoy }),
    staleTime: 30_000,
  })
}

/* Hook para registrar una venta (Barista) */
export function useRegistrarVenta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: registrarVenta,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mis-ventas'] })
      qc.invalidateQueries({ queryKey: ['productos-admin'] })
      qc.invalidateQueries({ queryKey: ['ingredientes'] })
      qc.invalidateQueries({ queryKey: ['alertas'] })
    },
  })
}

/* Hook para el Admin: todas las ventas con filtros */
export function useVentas(filtros: FiltrosVentas) {
  const { data: ventas = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['ventas', filtros],
    queryFn: () => getVentas(filtros),
    staleTime: 30_000,
  })

  const stats = useMemo(() => {
    const total         = ventas.reduce((s, v) => s + v.total, 0)
    const cantidad      = ventas.length
    const promedio      = cantidad > 0 ? Math.round(total / cantidad) : 0
    return { total, cantidad, promedio }
  }, [ventas])

  const topProductos = useMemo(() => {
    const map = new Map<string, number>()
    ventas.forEach((v) => {
      v.productos.forEach((p) => {
        map.set(p.prod_id, (map.get(p.prod_id) ?? 0) + p.cantidad)
      })
    })
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([prod_id, cantidad]) => ({ prod_id, cantidad }))
  }, [ventas])

  const ingresosPorBarista = useMemo(() => {
    const map = new Map<string, { total: number; cantidad: number }>()
    ventas.forEach((v) => {
      const prev = map.get(v.barista_id) ?? { total: 0, cantidad: 0 }
      map.set(v.barista_id, { total: prev.total + v.total, cantidad: prev.cantidad + 1 })
    })
    return Array.from(map.entries())
      .map(([barista_id, data]) => ({
        barista_id,
        total: data.total,
        cantidad: data.cantidad,
        promedio: Math.round(data.total / data.cantidad),
      }))
      .sort((a, b) => b.total - a.total)
  }, [ventas])

  const exportCSV = (productos: { prod_id: string; nombre: string }[]) => {
    const nombreProd = (id: string) => productos.find(p => p.prod_id === id)?.nombre ?? id
    const header = 'Fecha,Hora,Barista,Productos,Total'
    const rows = ventas.map((v) => {
      const fecha = new Date(v.fecha)
      const prods = v.productos.map(p => `${nombreProd(p.prod_id)} x${p.cantidad}`).join(' | ')
      return [
        fecha.toLocaleDateString('es-CO'),
        fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        v.barista_id,
        `"${prods}"`,
        v.total,
      ].join(',')
    })
    const csv  = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `ventas_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return { ventas, stats, topProductos, ingresosPorBarista, isLoading, isError, refetch, exportCSV }
}

/* Helpers compartidos */
export function formatPeso(n: number) {
  return `$${n.toLocaleString('es-CO')}`
}

export function formatHora(fecha: string) {
  return new Date(fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

export function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}
