import { useState, useMemo, useEffect } from 'react'
import { useAlertasContext } from '../context/AlertasContext'

const PAGE_SIZE = 10

const NIVEL_LABEL: Record<string, string> = { bajo: 'Bajo', agotado: 'Agotado', critico: 'Critico' }
const VISTO_LABEL: Record<string, string> = { pendiente: 'Pendiente', resuelto: 'Resuelto' }

export function useAlertas() {
  const { alertas, marcarResuelto, marcarTodasResueltas, eliminarAlerta } = useAlertasContext()

  const [searchQuery,  setSearchQuery]  = useState('')
  const [filtroNivel,  setFiltroNivel]  = useState<'todos' | 'bajo' | 'agotado' | 'critico'>('todos')
  const [sortOrder,    setSortOrder]    = useState<'asc' | 'desc'>('desc')
  const [currentPage,  setCurrentPage]  = useState(1)

  // reset page on filter/search change
  useEffect(() => { setCurrentPage(1) }, [filtroNivel, searchQuery, sortOrder])

  const allFiltered = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return [...alertas]
      .filter((a) => filtroNivel === 'todos' || a.nivel === filtroNivel)
      .filter((a) => {
        if (!q) return true
        return a.mensaje.toLowerCase().includes(q) ||
               a.ingrediente.toLowerCase().includes(q) ||
               a.ingredienteId.toLowerCase().includes(q)
      })
      .sort((a, b) => {
        const cmp = a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0
        return sortOrder === 'desc' ? -cmp : cmp
      })
  }, [alertas, filtroNivel, searchQuery, sortOrder])

  const totalPages = Math.max(1, Math.ceil(allFiltered.length / PAGE_SIZE))
  const safePage   = Math.min(currentPage, totalPages)
  const filteredAlertas = allFiltered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const stats = useMemo(() => ({
    total:      alertas.length,
    bajo:       alertas.filter((a) => a.nivel === 'bajo').length,
    agotado:    alertas.filter((a) => a.nivel === 'agotado').length,
    critico:    alertas.filter((a) => a.nivel === 'critico').length,
    pendientes: alertas.filter((a) => a.visto === 'pendiente').length,
  }), [alertas])

  const exportCSV = () => {
    const headers = ['ID', 'Fecha', 'Ingrediente ID', 'Ingrediente', 'Nivel', 'Mensaje', 'Estado']
    const rows = alertas.map((a) => [
      a.id, a.fecha, a.ingredienteId, a.ingrediente,
      NIVEL_LABEL[a.nivel] ?? a.nivel,
      a.mensaje,
      VISTO_LABEL[a.visto] ?? a.visto,
    ])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const tag  = document.createElement('a')
    tag.href = url; tag.download = 'alertas.csv'; tag.click()
    URL.revokeObjectURL(url)
  }

  return {
    alertas,
    filteredAlertas,
    allFilteredCount: allFiltered.length,
    currentPage:    safePage,
    totalPages,
    pageSize:       PAGE_SIZE,
    setCurrentPage,
    searchQuery,    setSearchQuery,
    filtroNivel,    setFiltroNivel,
    sortOrder,      toggleSortOrder: () => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc')),
    marcarResuelto, marcarTodasResueltas,
    eliminarAlerta,
    exportCSV,
    stats,
  }
}
