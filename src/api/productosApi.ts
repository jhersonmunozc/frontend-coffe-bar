import axiosInstance from './axiosInstance'
import type { Producto } from '../types/cafesino.types'

interface MenuResponse {
  disponibles: Producto[]
  noDisponibles: (Omit<Producto, 'disponible'> & { razon: string })[]
}

export async function obtenerMenu(): Promise<MenuResponse> {
  const { data } = await axiosInstance.get<MenuResponse>('/productos/menu')
  return data
}
