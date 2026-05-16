import { useState }               from 'react'
import { Topbar }                   from '../../components/layout/Topbar'
import { AlertBanner }              from '../../components/ingredientes/AlertBanner'
import { ProductStatsGrid }         from '../../components/productos/ProductStatsGrid'
import { ProductsTable }            from '../../components/productos/ProductsTable'
import { ModalProducto, ModalEliminarProducto } from '../../components/productos/ProductModal'
import { useProductos }             from '../../hooks/useProductos'
import type { Producto }            from '../../types/cafesino.types'

export default function ProductosPage() {
  const {
    filteredProductos, stats, isLoading, isError, refetch,
    searchQuery, setSearchQuery,
    filtroCategoria, setFiltroCategoria,
    filtroDisponible, setFiltroDisponible,
    mutCrear, mutEditar, mutEliminar,
    toggleDisponible, exportCSV,
  } = useProductos()

  const [modalOpen,   setModalOpen]   = useState(false)
  const [paraEditar,  setParaEditar]  = useState<Producto | null>(null)
  const [paraEliminar,setParaEliminar]= useState<Producto | null>(null)

  const abrirEditar = (p: Producto) => { setParaEditar(p); setModalOpen(true) }
  const cerrarModal = () => { setModalOpen(false); setParaEditar(null) }

  const BTN_PRIMARY: React.CSSProperties = {
    padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: 13.5, fontWeight: 600, background: 'var(--cafe)', color: '#fff', fontFamily: 'inherit',
  }

  if (isLoading) {
    return (
      <div style={{ padding: 32, background: 'var(--bg)', minHeight: '100vh' }}>
        <div style={{ height: 72, background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)', marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          {[0,1,2,3].map((i) => (
            <div key={i} style={{ height: 100, background: '#fff', borderRadius: 14, border: '1px solid var(--border)' }} />
          ))}
        </div>
        <div style={{ height: 360, background: '#fff', borderRadius: 16, border: '1px solid var(--border)' }} />
      </div>
    )
  }

  if (isError) {
    return (
      <div style={{ padding: 32, background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--red)', marginBottom: 8 }}>No se pudo cargar el catalogo</p>
          <button onClick={() => refetch()} style={BTN_PRIMARY}>Reintentar</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 32, background: 'var(--bg)', minHeight: '100vh' }}>
      <Topbar
        title="Productos"
        subtitle={`Gestion del catalogo \u00b7 ${stats.total} productos registrados`}
        labelBoton="Nuevo producto"
        onNuevo={() => { setParaEditar(null); setModalOpen(true) }}
        searchPlaceholder="Buscar producto o categoria..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onExportar={exportCSV}
      />

      <ProductStatsGrid
        total={stats.total}
        disponibles={stats.disponibles}
        noDisponibles={stats.noDisponibles}
        precioPromedio={stats.precioPromedio}
      />

      {stats.noDisponibles > 0 && (
        <AlertBanner message={`${stats.noDisponibles} producto${stats.noDisponibles > 1 ? 's' : ''} marcados como no disponibles en el catalogo.`} />
      )}

      <ProductsTable
        rows={filteredProductos}
        filtroCategoria={filtroCategoria}
        setFiltroCategoria={setFiltroCategoria}
        filtroDisponible={filtroDisponible as 'todos' | 'si' | 'no'}
        setFiltroDisponible={setFiltroDisponible}
        onToggle={toggleDisponible}
        onEdit={abrirEditar}
        onDelete={(p) => setParaEliminar(p)}
      />

      <ModalProducto
        producto={paraEditar}
        isOpen={modalOpen}
        onClose={cerrarModal}
        onSubmit={(data) => {
          if (paraEditar) {
            mutEditar.mutate({ prod_id: paraEditar.prod_id, datos: data }, { onSuccess: cerrarModal })
          } else {
            const { prod_id, ...rest } = data as typeof data & { prod_id?: string }
            mutCrear.mutate({ ...(prod_id ? { prod_id } : {}), ...rest } as Parameters<typeof mutCrear.mutate>[0], { onSuccess: cerrarModal })
          }
        }}
        isPending={mutCrear.isPending || mutEditar.isPending}
        isError={mutCrear.isError || mutEditar.isError}
      />

      <ModalEliminarProducto
        producto={paraEliminar}
        onClose={() => setParaEliminar(null)}
        onConfirm={(id) => mutEliminar.mutate(id, { onSuccess: () => setParaEliminar(null) })}
        isPending={mutEliminar.isPending}
      />
    </div>
  )
}
