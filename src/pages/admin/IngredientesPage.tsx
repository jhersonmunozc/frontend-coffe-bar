import { useState }           from 'react'
import { Search, Download, Plus } from 'lucide-react'
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
  fontFamily: 'inherit', transition: 'background 0.15s',
}
const BTN_SECONDARY: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
  borderRadius: 8, cursor: 'pointer', fontSize: 13.5, fontWeight: 500,
  background: 'transparent', border: '1.5px solid var(--border)',
  color: 'var(--muted)', fontFamily: 'inherit',
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

      {/* ?? Topbar de p?gina ?? */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '14px 20px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
            Ingredientes
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
            Gestion de inventario &middot; {stats.total} ingredientes registrados
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg)', border: '1.5px solid var(--border)',
            borderRadius: 8, padding: '7px 12px', width: 200,
          }}>
            <Search size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar ingrediente..."
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13.5, color: 'var(--text)', width: '100%', fontFamily: 'inherit' }}
            />
          </div>
          {/* Exportar */}
          <button onClick={exportCSV} style={BTN_SECONDARY}>
            <Download size={14} /> Exportar
          </button>
          {/* Nuevo */}
          <button
            onClick={() => setModalCrear(true)}
            style={BTN_PRIMARY}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--cafe-dark)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--cafe)')}
          >
            <Plus size={14} /> Nuevo ingrediente
          </button>
        </div>
      </div>

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
