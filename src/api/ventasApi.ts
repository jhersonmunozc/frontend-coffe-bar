import axiosInstance from './axiosInstance'
import type { Venta } from '../types/cafesino.types'

export interface ReporteDiario {
  fecha: string
  totalDia: number
  cantidadVentas: number
  promedioPorVenta: number
}

export interface FiltrosVentas {
  fecha_inicio?: string
  fecha_fin?: string
  barista_id?: string
}

export async function getReporteDiario(): Promise<ReporteDiario> {
  const { data } = await axiosInstance.get<ReporteDiario>('/ventas/reporte/diario')
  return data
}

export async function getMisVentas(filtros?: Pick<FiltrosVentas, 'fecha_inicio' | 'fecha_fin'>): Promise<Venta[]> {
  const params = new URLSearchParams()
  if (filtros?.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio)
  if (filtros?.fecha_fin)    params.append('fecha_fin',    filtros.fecha_fin)
  const { data } = await axiosInstance.get<Venta[]>(`/ventas/mis-ventas?${params}`)
  return data
}

export async function getVentas(filtros?: FiltrosVentas): Promise<Venta[]> {
  const params = new URLSearchParams()
  if (filtros?.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio)
  if (filtros?.fecha_fin)    params.append('fecha_fin',    filtros.fecha_fin)
  if (filtros?.barista_id)   params.append('barista_id',   filtros.barista_id)
  const { data } = await axiosInstance.get<Venta[]>(`/ventas?${params}`)
  return data
}

export async function registrarVenta(body: {
  venta_id: string
  productos: { prod_id: string; cantidad: number }[]
  total: number
}): Promise<{ venta: Venta; alertas_generadas: unknown[] }> {
  const { data } = await axiosInstance.post('/ventas', body)
  return data
}
