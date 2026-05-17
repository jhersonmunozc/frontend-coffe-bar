import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getUsuarios, crearUsuario, editarUsuario, eliminarUsuario,
  type CrearUsuarioDto,
} from '../api/usuariosApi'

export function useUsuarios() {
  const qc = useQueryClient()
  const invalidar = () => qc.invalidateQueries({ queryKey: ['usuarios'] })

  const { data: usuarios = [], isLoading, isError } = useQuery({
    queryKey: ['usuarios'],
    queryFn: getUsuarios,
  })

  const mutCrear = useMutation({
    mutationFn: crearUsuario,
    onSuccess: invalidar,
  })

  const mutEditar = useMutation({
    mutationFn: ({ usuario_id, datos }: { usuario_id: string; datos: Partial<Omit<CrearUsuarioDto, 'usuario_id'>> }) =>
      editarUsuario(usuario_id, datos),
    onSuccess: invalidar,
  })

  const mutEliminar = useMutation({
    mutationFn: eliminarUsuario,
    onSuccess: invalidar,
  })

  const mutToggle = useMutation({
    mutationFn: ({ usuario_id, activo }: { usuario_id: string; activo: boolean }) =>
      editarUsuario(usuario_id, { activo } as any),
    onSuccess: invalidar,
  })

  return { usuarios, isLoading, isError, mutCrear, mutEditar, mutEliminar, mutToggle }
}
