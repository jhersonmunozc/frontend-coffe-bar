import axiosInstance from './axiosInstance'
import type { Producto } from '../types/cafesino.types'

interface MenuResponse {
  disponibles: Producto[]
  noDisponibles: (Omit<Producto, 'disponible'> & { razon: string })[]
}

export interface TopVendido {
  prod_id: string
  nombre: string
  precio: number
  totalVendido: number
  ingresoTotal: number
}

export async function obtenerMenu(): Promise<MenuResponse> {
  const { data } = await axiosInstance.get<MenuResponse>('/productos/menu')
  return data
}

export async function getTopVendido(): Promise<TopVendido | null> {
  const { data } = await axiosInstance.get<TopVendido | null>('/productos/kpi/top-vendido')
  return data
}

export async function getProductos(): Promise<Producto[]> {
  const { data } = await axiosInstance.get<Producto[]>('/productos')
  return data
}

export async function crearProducto(body: Omit<Producto, '_id' | 'disponible'>): Promise<Producto> {
  const { data } = await axiosInstance.post<Producto>('/productos', body)
  return data
}

export async function editarProducto(prod_id: string, body: Partial<Omit<Producto, '_id' | 'prod_id'>>): Promise<Producto> {
  const { data } = await axiosInstance.put<Producto>(`/productos/${prod_id}`, body)
  return data
}

export async function eliminarProducto(prod_id: string): Promise<void> {
  await axiosInstance.delete(`/productos/${prod_id}`)
}
