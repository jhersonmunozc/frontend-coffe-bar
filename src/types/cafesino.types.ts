export interface Usuario {
  usuario_id: string
  nombre: string
  rol: 'Barista' | 'Administrador'
  email: string
  activo: boolean
  ultimaConexion: string
}

export interface LoginResponse {
  token: string
  usuario: Pick<Usuario, 'usuario_id' | 'nombre' | 'rol' | 'email'>
}

export interface ApiError {
  message: string
}

export interface Ingrediente {
  ing_id: string
  nombre: string
  stock: number
  u_medida: 'ml' | 'g' | 'u'
  minimo: number
}

export interface Producto {
  prod_id: string
  nombre: string
  categoria: string
  precio: number
  disponible: boolean
}

export interface Venta {
  venta_id: string
  barista_id: string
  productos: string[]
  total: number
  fecha: string
}

export interface Alerta {
  alert_id: string
  ing_id: string
  nivel: 'Bajo' | 'Agotado'
  msj: string
  fecha: string
  visto: boolean
}
