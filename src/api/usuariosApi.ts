import axiosInstance from './axiosInstance'
import type { Usuario } from '../types/cafesino.types'

export interface CrearUsuarioDto {
  usuario_id: string
  nombre: string
  rol: 'Barista' | 'Administrador'
  email: string
  password: string
}

export async function getUsuarios(): Promise<Usuario[]> {
  const { data } = await axiosInstance.get<Usuario[]>('/usuarios')
  return data
}

export async function crearUsuario(body: CrearUsuarioDto): Promise<Usuario> {
  const { data } = await axiosInstance.post<Usuario>('/usuarios', body)
  return data
}

export async function editarUsuario(
  usuario_id: string,
  body: Partial<Omit<CrearUsuarioDto, 'usuario_id'>>
): Promise<Usuario> {
  const { data } = await axiosInstance.put<Usuario>(`/usuarios/${usuario_id}`, body)
  return data
}

export async function eliminarUsuario(usuario_id: string): Promise<void> {
  await axiosInstance.delete(`/usuarios/${usuario_id}`)
}
