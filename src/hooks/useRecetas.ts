import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRecetas, crearReceta, actualizarReceta, eliminarReceta } from '../api/recetasApi'
import { crearIngrediente }  from '../api/ingredientesApi'
import { crearProducto }     from '../api/productosApi'
import type { Receta, RecetaIngrediente, Ingrediente } from '../types/cafesino.types'

export interface NuevoIngredienteForm extends Omit<Ingrediente, '_id'> {
  cantidad: number
  esNuevo:  boolean
}

export interface CrearRecetaPayload {
  prod_id:     string
  nombre:      string
  categoria:   string
  precio:      number
  imagen_url:  string
  ingredientes: NuevoIngredienteForm[]
}

export function useRecetas() {
  const qc = useQueryClient()

  const { data: recetas = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['recetas'],
    queryFn: getRecetas,
    staleTime: 30_000,
  })

  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['recetas'] })
    qc.invalidateQueries({ queryKey: ['productos-admin'] })
    qc.invalidateQueries({ queryKey: ['ingredientes'] })
    qc.invalidateQueries({ queryKey: ['menu-publico'] })
  }

  /* Crea ingredientes nuevos, el producto y la receta en secuencia */
  const mutCrearCompleto = useMutation({
    mutationFn: async (payload: CrearRecetaPayload) => {
      // 1. Crear ingredientes nuevos
      for (const ing of payload.ingredientes) {
        if (ing.esNuevo) {
          await crearIngrediente({
            ing_id:   ing.ing_id,
            nombre:   ing.nombre,
            stock:    ing.stock,
            u_medida: ing.u_medida,
            minimo:   ing.minimo,
          })
        }
      }
      // 2. Crear el producto
      await crearProducto({
        prod_id:    payload.prod_id,
        nombre:     payload.nombre,
        categoria:  payload.categoria,
        precio:     payload.precio,
        imagen_url: payload.imagen_url,
      })
      // 3. Crear la receta
      const recetaIngredientes: RecetaIngrediente[] = payload.ingredientes.map((i) => ({
        ing_id:   i.ing_id,
        cantidad: i.cantidad,
      }))
      return crearReceta({ prod_id: payload.prod_id, ingredientes: recetaIngredientes })
    },
    onSuccess: invalidar,
  })

  const mutActualizar = useMutation({
    mutationFn: ({ prod_id, ingredientes }: { prod_id: string; ingredientes: RecetaIngrediente[] }) =>
      actualizarReceta(prod_id, ingredientes),
    onSuccess: invalidar,
  })

  const mutEliminar = useMutation({
    mutationFn: eliminarReceta,
    onSuccess: invalidar,
  })

  return {
    recetas, isLoading, isError, refetch,
    mutCrearCompleto, mutActualizar, mutEliminar,
  }
}
