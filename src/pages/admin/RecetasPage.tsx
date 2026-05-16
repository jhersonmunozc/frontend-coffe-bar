import { useState } from 'react'
import { BookOpen, Trash2 } from 'lucide-react'
import { Topbar }       from '../../components/layout/Topbar'
import { ModalReceta }  from '../../components/recetas/ModalReceta'
import { useRecetas }   from '../../hooks/useRecetas'
import { useIngredientes } from '../../hooks/useIngredientes'
import { useProductos }    from '../../hooks/useProductos'

export default function RecetasPage() {
  const [modalOpen,   setModalOpen]   = useState(false)
  const [confirmar,   setConfirmar]   = useState<string | null>(null)

  const { recetas, isLoading, isError, refetch, mutCrearCompleto, mutEliminar } = useRecetas()
  const { ingredientes }  = useIngredientes()
  const { productos }     = useProductos()

  const getProducto = (prod_id: string) => productos.find((p) => p.prod_id === prod_id)

  const BTN_P: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
    borderRadius: 8, border: 'none', cursor: 'pointer',
    background: 'var(--cafe)', color: '#fff', fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit',
  }
  const BTN_S: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    borderRadius: 8, cursor: 'pointer', background: 'transparent',
    border: '1.5px solid var(--border)', color: 'var(--muted)', fontSize: 13.5, fontWeight: 500, fontFamily: 'inherit',
  }

  if (isLoading) {
    return (
      <div style={{ padding: 32, background: 'var(--bg)', minHeight: '100vh' }}>
        <div style={{ height: 72, background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)', marginBottom: 24 }} />
        <div style={{ height: 360, background: '#fff', borderRadius: 16, border: '1px solid var(--border)' }} />
      </div>
    )
  }

  if (isError) {
    return (
      <div style={{ padding: 32, background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--red)', marginBottom: 8 }}>No se pudo cargar las recetas</p>
          <button onClick={() => refetch()} style={BTN_P}>Reintentar</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 32, background: 'var(--bg)', minHeight: '100vh' }}>
      <Topbar
        title="Recetas"
        subtitle={`Gestion de recetas \u00b7 ${recetas.length} recetas registradas`}
        labelBoton="Nueva receta"
        onNuevo={() => setModalOpen(true)}
        searchPlaceholder="Buscar receta..."
        searchValue=""
        onSearchChange={() => {}}
        onExportar={() => {}}
      />

      {/* Tabla de recetas */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Recetas del catalogo</span>
        </div>

        {recetas.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)' }}>
            <BookOpen size={32} style={{ margin: '0 auto 10px', opacity: 0.35 }} />
            <p style={{ fontSize: 14 }}>No hay recetas registradas</p>
            <p style={{ fontSize: 12.5, marginTop: 4 }}>Usa "+ Nueva receta" para crear el primer producto con receta.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--bg)' }}>
                <tr>
                  {['Producto', 'Precio', 'Imagen', 'Ingredientes', 'Acciones'].map((h) => (
                    <th key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '11px 16px', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recetas.map((receta, idx) => {
                  const prod = getProducto(receta.prod_id)
                  return (
                    <tr
                      key={receta.prod_id}
                      style={{ borderBottom: idx < recetas.length - 1 ? '1px solid var(--border)' : 'none', animation: 'fadeInRow 0.25s ease both', animationDelay: `${idx * 30}ms` }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{prod?.nombre ?? receta.prod_id}</div>
                        <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{receta.prod_id}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                        {prod ? `$${prod.precio.toLocaleString('es-CO')}` : '?'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {prod?.imagen_url ? (
                          <img src={prod.imagen_url} alt={prod.nombre} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                        ) : (
                          <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 10 }}>Sin img</div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {receta.ingredientes.map((ing) => {
                            const ingData = ingredientes.find((i) => i.ing_id === ing.ing_id)
                            return (
                              <span key={ing.ing_id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 8px', fontSize: 11.5, color: 'var(--text)' }}>
                                {ingData?.nombre ?? ing.ing_id} <span style={{ color: 'var(--muted)' }}>x{ing.cantidad}</span>
                              </span>
                            )
                          })}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          title="Eliminar receta"
                          onClick={() => setConfirmar(receta.prod_id)}
                          style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', transition: 'all 0.15s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--red-bg)'; e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
                        ><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal creacion */}
      <ModalReceta
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(p) => mutCrearCompleto.mutate(p, { onSuccess: () => setModalOpen(false) })}
        isPending={mutCrearCompleto.isPending}
        isError={mutCrearCompleto.isError}
        ingredientes={ingredientes}
      />

      {/* Confirm eliminar receta */}
      {confirmar && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setConfirmar(null)}>
          <div style={{ background: 'var(--surface)', borderRadius: 18, padding: 28, width: 400, maxWidth: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Eliminar receta</h2>
            <p style={{ fontSize: 14, color: 'var(--text)', marginBottom: 6 }}>
              Se eliminara la receta de <strong>{getProducto(confirmar)?.nombre ?? confirmar}</strong>.
            </p>
            <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 22 }}>
              El producto quedara sin receta y no aparecera en el menu publico.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setConfirmar(null)} style={BTN_S}>Cancelar</button>
              <button
                onClick={() => mutEliminar.mutate(confirmar, { onSuccess: () => setConfirmar(null) })}
                disabled={mutEliminar.isPending}
                style={{ ...BTN_P, background: 'var(--red)' }}
              >
                {mutEliminar.isPending ? 'Eliminando...' : 'Eliminar receta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
