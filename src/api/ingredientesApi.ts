import axiosInstance from './axiosInstance'
import type { Ingrediente } from '../types/cafesino.types'

export async function getIngredientes(): Promise<Ingrediente[]> {
  const { data } = await axiosInstance.get<Ingrediente[]>('/ingredientes')
  return data
}

export async function getCriticos(): Promise<Ingrediente[]> {
  const { data } = await axiosInstance.get<Ingrediente[]>('/ingredientes/listado/criticos')
  return data
}

export async function crearIngrediente(body: Omit<Ingrediente, '_id'>): Promise<Ingrediente> {
  const { data } = await axiosInstance.post<Ingrediente>('/ingredientes', body)
  return data
}

export async function editarIngrediente(ing_id: string, body: Partial<Omit<Ingrediente, '_id' | 'ing_id'>>): Promise<Ingrediente> {
  const { data } = await axiosInstance.put<Ingrediente>(`/ingredientes/${ing_id}`, body)
  return data
}

export async function agregarStock(ing_id: string, cantidad: number): Promise<Ingrediente> {
  const { data } = await axiosInstance.put<Ingrediente>('/ingredientes/actualizar/stock', { ing_id, cantidad })
  return data
}

export async function eliminarIngrediente(ing_id: string): Promise<void> {
  await axiosInstance.delete(`/ingredientes/${ing_id}`)
}
