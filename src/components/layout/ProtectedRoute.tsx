import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import type { Usuario } from '../../types/cafesino.types'

interface Props {
  rolesPermitidos: Usuario['rol'][]
}

export function ProtectedRoute({ rolesPermitidos }: Props) {
  const usuario = useAuthStore((s) => s.usuario)

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (!rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
