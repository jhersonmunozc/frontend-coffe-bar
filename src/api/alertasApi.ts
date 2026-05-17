import axiosInstance from './axiosInstance'
import type { Alerta } from '../types/cafesino.types'

export async function getHistorialAlertas(): Promise<Alerta[]> {
  const { data } = await axiosInstance.get<Alerta[]>('/alertas/historial/todas')
  return data
}

export async function marcarAlertaVista(alert_id: string): Promise<Alerta> {
  const { data } = await axiosInstance.patch<Alerta>(`/alertas/${alert_id}/marcar-visto`)
  return data
}

export async function eliminarAlertaApi(alert_id: string): Promise<void> {
  await axiosInstance.delete(`/alertas/${alert_id}`)
}
