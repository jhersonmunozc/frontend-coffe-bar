import { useState }           from 'react'
import { Topbar }                 from '../../components/layout/Topbar'
import { useIngredientes }        from '../../hooks/useIngredientes'
import { StatsGrid }              from '../../components/ingredientes/StatsGrid'
import { AlertBanner }            from '../../components/ingredientes/AlertBanner'
import { IngredientsTable }       from '../../components/ingredientes/IngredientsTable'
import {
  ModalCrearIngrediente,
  ModalEditarIngrediente,
  ModalAgregarStock,
  ModalEliminarIngrediente,
} from '../../components/ingredientes/IngredientModal'
import type { Ingrediente } from '../../types/cafesino.types'

const BTN_PRIMARY: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
  borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13.5,
  fontWeight: 600, background: 'var(--cafe)', color: '#fff',
  fontFamily: 'inherit',
}

export default function IngredientesPage() {
  const {
    filtered, stats, isLoading, isError, refetch,
    filtro, setFiltro, query, setQuery,
    mutCrear, mutEditar, mutStock, mutEliminar,
    exportCSV,
  } = useIngredientes()

  /* Estado de modales */
  const [modalCrear,  setModalCrear]  = useState(false)
  const [paraEditar,  setParaEditar]  = useState<Ingrediente | null>(null)
  const [paraStock,   setParaStock]   = useState<Ingrediente | null>(null)
  const [paraEliminar,setParaEliminar]= useState<Ingrediente | null>(null)

  /* Skeleton loader */
  if (isLoading) {
    return (
      <div style={{ padding: 32, background: 'var(--bg)', minHeight: '100vh' }}>
        <div style={{ height: 28, width: 200, background: '#E8DDD4', borderRadius: 8, marginBottom: 8 }} />
        <div style={{ height: 16, width: 280, background: '#E8DDD4', borderRadius: 6, marginBottom: 28 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          {[0,1,2,3].map((i) => (
            <div key={i} style={{ height: 100, background: '#fff', borderRadius: 14, border: '1px solid var(--border)', animation: 'pulse 1.4s ease-in-out infinite' }} />
          ))}
        </div>
        <div style={{ height: 360, background: '#fff', borderRadius: 16, border: '1px solid var(--border)' }} />
      </div>
    )
  }

  /* Error state */
  if (isError) {
    return (
      <div style={{ padding: 32, background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--red)', marginBottom: 8 }}>No se pudo cargar el inventario</p>
          <button onClick={() => refetch()} style={BTN_PRIMARY}>Reintentar</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 32, background: 'var(--bg)', minHeight: '100vh' }}>

      <Topbar
        title="Ingredientes"
        subtitle={`Gestion de inventario \u00b7 ${stats.total} ingredientes registrados`}
        labelBoton="Nuevo ingrediente"
        onNuevo={() => setModalCrear(true)}
        searchPlaceholder="Buscar ingrediente..."
        searchValue={query}
        onSearchChange={setQuery}
        onExportar={exportCSV}
      />

      {/* Stats */}
      <StatsGrid total={stats.total} ok={stats.ok} low={stats.low} crit={stats.crit} />

      {/* Alert banner */}
      <AlertBanner crit={stats.crit} low={stats.low} />

      {/* Tabla */}
      <IngredientsTable
        rows={filtered}
        filtro={filtro}
        setFiltro={setFiltro}
        onStock={(ing) => setParaStock(ing)}
        onEdit={(ing) => setParaEditar(ing)}
        onDelete={(ing) => setParaEliminar(ing)}
      />

      {/* Modales */}
      <ModalCrearIngrediente
        isOpen={modalCrear}
        onClose={() => setModalCrear(false)}
        onSubmit={(d) => mutCrear.mutate(d, { onSuccess: () => setModalCrear(false) })}
        isPending={mutCrear.isPending}
        isError={mutCrear.isError}
      />
      <ModalEditarIngrediente
        ing={paraEditar}
        onClose={() => setParaEditar(null)}
        onSubmit={(id, d) => mutEditar.mutate({ ing_id: id, datos: d }, { onSuccess: () => setParaEditar(null) })}
        isPending={mutEditar.isPending}
        isError={mutEditar.isError}
      />
      <ModalAgregarStock
        ing={paraStock}
        onClose={() => setParaStock(null)}
        onSubmit={(id, cant) => mutStock.mutate({ ing_id: id, cantidad: cant }, { onSuccess: () => setParaStock(null) })}
        isPending={mutStock.isPending}
      />
      <ModalEliminarIngrediente
        ing={paraEliminar}
        onClose={() => setParaEliminar(null)}
        onConfirm={(id) => mutEliminar.mutate(id, { onSuccess: () => setParaEliminar(null) })}
        isPending={mutEliminar.isPending}
      />
    </div>
  )
}
