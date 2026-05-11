import { create } from 'zustand'
import type { Usuario } from '../types/cafesino.types'

interface AuthState {
  token: string | null
  usuario: Pick<Usuario, 'usuario_id' | 'nombre' | 'rol' | 'email'> | null
  setAuth: (token: string, usuario: Pick<Usuario, 'usuario_id' | 'nombre' | 'rol' | 'email'>) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  usuario: null,
  setAuth: (token, usuario) => set({ token, usuario }),
  clearAuth: () => set({ token: null, usuario: null }),
}))
