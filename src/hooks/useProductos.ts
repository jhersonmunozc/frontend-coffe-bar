import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProductos,
  crearProducto,
  editarProducto,
  eliminarProducto,
} from '../api/productosApi'
import type { Producto } from '../types/cafesino.types'

export function useProductos() {
  const qc = useQueryClient()
  const [searchQuery,       setSearchQuery]       = useState('')
  const [filtroCategoria,   setFiltroCategoria]   = useState('todos')
  const [filtroDisponible,  setFiltroDisponible]  = useState('todos')

  const { data: productos = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['productos-admin'],
    queryFn: getProductos,
    staleTime: 30_000,
  })

  const filteredProductos = useMemo(() => {
    let list = productos
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((p) => p.nombre.toLowerCase().includes(q) || p.prod_id.toLowerCase().includes(q))
    }
    if (filtroCategoria !== 'todos') {
      list = list.filter((p) => p.categoria === filtroCategoria)
    }
    if (filtroDisponible === 'si')  list = list.filter((p) => p.disponible)
    if (filtroDisponible === 'no')  list = list.filter((p) => !p.disponible)
    return list
  }, [productos, searchQuery, filtroCategoria, filtroDisponible])

  const stats = useMemo(() => {
    const disponibles    = productos.filter((p) => p.disponible).length
    const noDisponibles  = productos.filter((p) => !p.disponible).length
    const precioPromedio = productos.length
      ? Math.round(productos.reduce((s, p) => s + p.precio, 0) / productos.length)
      : 0
    return { total: productos.length, disponibles, noDisponibles, precioPromedio }
  }, [productos])

  const invalidar = () => qc.invalidateQueries({ queryKey: ['productos-admin'] })

  const mutCrear    = useMutation({ mutationFn: crearProducto,   onSuccess: invalidar })
  const mutEditar   = useMutation({
    mutationFn: ({ prod_id, datos }: { prod_id: string; datos: Partial<Omit<Producto, '_id' | 'prod_id'>> }) =>
      editarProducto(prod_id, datos),
    onSuccess: invalidar,
  })
  const mutEliminar = useMutation({ mutationFn: eliminarProducto, onSuccess: invalidar })

  /* Optimistic toggle disponible */
  const mutToggle = useMutation({
    mutationFn: ({ prod_id, disponible }: { prod_id: string; disponible: boolean }) =>
      editarProducto(prod_id, { disponible }),
    onMutate: async ({ prod_id, disponible }) => {
      await qc.cancelQueries({ queryKey: ['productos-admin'] })
      const prev = qc.getQueryData<Producto[]>(['productos-admin'])
      qc.setQueryData<Producto[]>(['productos-admin'], (old = []) =>
        old.map((p) => p.prod_id === prod_id ? { ...p, disponible } : p)
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['productos-admin'], ctx.prev)
    },
    onSettled: invalidar,
  })

  const toggleDisponible = (prod_id: string) => {
    const p = productos.find((x) => x.prod_id === prod_id)
    if (p) mutToggle.mutate({ prod_id, disponible: !p.disponible })
  }

  const exportCSV = () => {
    const header = 'ID,Nombre,Categoria,Precio,Disponible'
    const rows   = productos.map((p) =>
      [p.prod_id, `"${p.nombre}"`, p.categoria, p.precio, p.disponible ? 'Si' : 'No'].join(',')
    )
    const csv  = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `productos_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    productos, filteredProductos, stats,
    isLoading, isError, refetch,
    searchQuery, setSearchQuery,
    filtroCategoria, setFiltroCategoria,
    filtroDisponible, setFiltroDisponible,
    mutCrear, mutEditar, mutEliminar,
    toggleDisponible,
    exportCSV,
  }
}
