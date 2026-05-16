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
  _id?: string
  ing_id: string
  nombre: string
  stock: number
  u_medida: 'ml' | 'g' | 'u'
  minimo: number
}

export interface Producto {
  _id?: string
  prod_id: string
  nombre: string
  categoria: string
  precio: number
  disponible: boolean
  imagen_url?: string
}

export interface RecetaIngrediente {
  ing_id: string
  cantidad: number
}

export interface Receta {
  _id?: string
  prod_id: string
  ingredientes: RecetaIngrediente[]
}

export interface Venta {
  venta_id: string
  barista_id: string
  productos: { prod_id: string; cantidad: number }[]
  total: number
  fecha: string
}

export interface Alerta {
  _id?: string
  alert_id: string
  ing_id: string
  nivel: 'Bajo' | 'Agotado' | 'Critico'
  msj: string
  fecha: string
  visto: boolean
}
