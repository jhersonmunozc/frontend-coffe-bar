import axiosInstance from './axiosInstance'
import type { Alerta } from '../types/cafesino.types'

export async function getHistorialAlertas(): Promise<Alerta[]> {
  const { data } = await axiosInstance.get<Alerta[]>('/alertas/historial/todas')
  return data
}
