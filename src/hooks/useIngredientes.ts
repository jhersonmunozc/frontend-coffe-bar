import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getIngredientes,
  crearIngrediente,
  editarIngrediente,
  agregarStock,
  eliminarIngrediente,
} from '../api/ingredientesApi'
import type { Ingrediente } from '../types/cafesino.types'

export type EstadoFiltro = 'todos' | 'ok' | 'low' | 'crit'

export function getStatus(ing: Ingrediente): 'ok' | 'low' | 'crit' {
  if (ing.stock === 0 || ing.stock < ing.minimo) return 'crit'
  if (ing.stock < ing.minimo * 1.5)              return 'low'
  return 'ok'
}

export function useIngredientes() {
  const qc = useQueryClient()
  const [filtro, setFiltro] = useState<EstadoFiltro>('todos')
  const [query,  setQuery]  = useState('')

  const { data: ingredientes = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['ingredientes'],
    queryFn: getIngredientes,
    staleTime: 30_000,
  })

  const filtered = useMemo(() => {
    let list = ingredientes
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((i) => i.nombre.toLowerCase().includes(q) || i.ing_id.toLowerCase().includes(q))
    }
    if (filtro !== 'todos') list = list.filter((i) => getStatus(i) === filtro)
    return list
  }, [ingredientes, filtro, query])

  const stats = useMemo(() => ({
    total: ingredientes.length,
    ok:    ingredientes.filter((i) => getStatus(i) === 'ok').length,
    low:   ingredientes.filter((i) => getStatus(i) === 'low').length,
    crit:  ingredientes.filter((i) => getStatus(i) === 'crit').length,
  }), [ingredientes])

  const invalidar = () => qc.invalidateQueries({ queryKey: ['ingredientes'] })

  const mutCrear    = useMutation({ mutationFn: crearIngrediente, onSuccess: invalidar })
  const mutEditar   = useMutation({
    mutationFn: ({ ing_id, datos }: { ing_id: string; datos: Partial<Omit<Ingrediente, '_id' | 'ing_id'>> }) =>
      editarIngrediente(ing_id, datos),
    onSuccess: invalidar,
  })
  const mutStock    = useMutation({
    mutationFn: ({ ing_id, cantidad }: { ing_id: string; cantidad: number }) => agregarStock(ing_id, cantidad),
    onSuccess: invalidar,
  })
  const mutEliminar = useMutation({ mutationFn: eliminarIngrediente, onSuccess: invalidar })

  const exportCSV = () => {
    const header = 'ID,Nombre,Stock,Unidad,Minimo,Estado'
    const rows = ingredientes.map((i) =>
      [i.ing_id, `"${i.nombre}"`, i.stock, i.u_medida, i.minimo, getStatus(i)].join(',')
    )
    const csv  = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `ingredientes_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    ingredientes, filtered, stats,
    isLoading, isError, refetch,
    filtro, setFiltro,
    query, setQuery,
    mutCrear, mutEditar, mutStock, mutEliminar,
    exportCSV,
  }
}
