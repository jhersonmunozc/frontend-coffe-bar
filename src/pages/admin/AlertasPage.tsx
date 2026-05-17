import { CheckCheck, Download } from 'lucide-react'
import { Topbar }        from '../../components/layout/Topbar'
import { AlertasStats }  from '../../components/alertas/AlertasStats'
import { AlertasTable }  from '../../components/alertas/AlertasTable'
import { useAlertas }    from '../../hooks/useAlertas'

export default function AlertasPage() {
  const {
    alertas, filteredAlertas, allFilteredCount,
    currentPage, totalPages, pageSize, setCurrentPage,
    searchQuery, setSearchQuery, filtroNivel, setFiltroNivel,
    sortOrder, toggleSortOrder, marcarResuelto,
    marcarTodasResueltas, eliminarAlerta, exportCSV, stats,
  } = useAlertas()

  return (
    <div style={{ padding: 32, background: 'var(--bg)', minHeight: '100vh' }}>
      <Topbar
        title="Alertas"
        subtitle={`Historial completo de alertas de stock \u00b7 ${alertas.length} alertas registradas`}
        onMarcarTodas={marcarTodasResueltas}
        labelMarcarTodas="Marcar todas vistas"
        onExportar={exportCSV}
      />

      <AlertasStats
        total={stats.total}
        bajo={stats.bajo}
        agotado={stats.agotado}
        critico={stats.critico}
      />

      <AlertasTable
        filteredAlertas={filteredAlertas}
        allFilteredCount={allFilteredCount}
        alertasTotal={alertas.length}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        setCurrentPage={setCurrentPage}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filtroNivel={filtroNivel}
        setFiltroNivel={setFiltroNivel}
        sortOrder={sortOrder}
        toggleSortOrder={toggleSortOrder}
        marcarResuelto={marcarResuelto}
        eliminarAlerta={eliminarAlerta}
      />
    </div>
  )
}
