import axiosInstance from './axiosInstance'
import type { Receta } from '../types/cafesino.types'

export async function getRecetas(): Promise<Receta[]> {
  const { data } = await axiosInstance.get<Receta[]>('/recetas')
  return data
}

export async function getRecetaPorProducto(prod_id: string): Promise<Receta | null> {
  try {
    const { data } = await axiosInstance.get<Receta>(`/recetas/${prod_id}`)
    return data
  } catch {
    return null
  }
}

export async function crearReceta(body: Omit<Receta, '_id'>): Promise<Receta> {
  const { data } = await axiosInstance.post<Receta>('/recetas', body)
  return data
}

export async function actualizarReceta(prod_id: string, ingredientes: Receta['ingredientes']): Promise<Receta> {
  const { data } = await axiosInstance.put<Receta>(`/recetas/${prod_id}`, { ingredientes })
  return data
}

export async function eliminarReceta(prod_id: string): Promise<void> {
  await axiosInstance.delete(`/recetas/${prod_id}`)
}
