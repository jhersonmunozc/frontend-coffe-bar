import { useState, useMemo } from 'react'
import { useQuery }      from '@tanstack/react-query'
import { Search, Coffee, AlertTriangle, Loader2 } from 'lucide-react'
import { obtenerMenu }   from '../../api/productosApi'
import { formatPeso }    from '../../hooks/useVentas'

const SURFACE: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
}

export default function BaristaMenuPage() {
  const [busqueda, setBusqueda] = useState('')

  const { data: menu, isLoading, isError } = useQuery({
    queryKey: ['menu-barista'],
    queryFn: obtenerMenu,
    staleTime: 60_000,
  })

  const disponibles    = menu?.disponibles    ?? []
  const noDisponibles  = menu?.noDisponibles  ?? []

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return disponibles
    const q = busqueda.toLowerCase()
    return disponibles.filter(p =>
      p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q)
    )
  }, [disponibles, busqueda])

  const categorias = useMemo(() =>
    Array.from(new Set(filtrados.map(p => p.categoria))).sort()
  , [filtrados])

  return (
    <div style={{ padding: '28px 32px', background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Encabezado */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
          Menú del día
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
          Productos disponibles para venta · {disponibles.length} disponibles, {noDisponibles.length} sin stock
        </p>
      </div>

      {/* Buscador */}
      <div style={{
        ...SURFACE, padding: '10px 16px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 10, maxWidth: 340,
      }}>
        <Search size={15} style={{ color: 'var(--muted)', flexShrink: 0 }} />
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar producto o categoría…"
          style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13.5, color: 'var(--text)', width: '100%', fontFamily: 'inherit' }}
        />
      </div>

      {isLoading ? (
        <div style={{ ...SURFACE, padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
          <Loader2 size={26} style={{ animation: 'spin 0.8s linear infinite', marginBottom: 8 }} />
          <p style={{ margin: 0, fontSize: 13 }}>Cargando menú…</p>
        </div>
      ) : isError ? (
        <div style={{ ...SURFACE, padding: 48, textAlign: 'center', color: 'var(--red)' }}>
          Error al cargar el menú. Verifica la conexión.
        </div>
      ) : (
        <>
          {/* Productos disponibles por categoría */}
          {categorias.length === 0 ? (
            <div style={{ ...SURFACE, padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
              <Coffee size={30} style={{ marginBottom: 10, opacity: 0.3 }} />
              <p style={{ margin: 0, fontSize: 13 }}>No se encontraron productos</p>
            </div>
          ) : (
            categorias.map(cat => (
              <div key={cat} style={{ marginBottom: 28 }}>
                <h2 style={{
                  fontSize: 12, fontWeight: 700, letterSpacing: '1px',
                  textTransform: 'uppercase', color: 'var(--muted)',
                  marginBottom: 12,
                }}>
                  {cat}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                  {filtrados.filter(p => p.categoria === cat).map((p, i) => (
                    <div
                      key={p.prod_id}
                      style={{
                        ...SURFACE, padding: '16px 18px',
                        borderLeft: '3px solid var(--green)',
                        animation: `fadeInUp 0.25s ease ${i * 0.04}s both`,
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                        {p.nombre}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>{p.prod_id}</div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--cafe)' }}>
                        {formatPeso(p.precio)}
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99,
                          background: 'rgba(45,122,79,0.10)', color: 'var(--green)',
                        }}>
                          Disponible
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Productos sin stock (colapsado al final) */}
          {noDisponibles.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <h2 style={{
                fontSize: 12, fontWeight: 700, letterSpacing: '1px',
                textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <AlertTriangle size={13} color="var(--amber)" /> Sin stock ({noDisponibles.length})
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                {noDisponibles.map((p, i) => (
                  <div
                    key={p.prod_id}
                    style={{
                      ...SURFACE, padding: '16px 18px',
                      borderLeft: '3px solid var(--border)',
                      opacity: 0.6,
                      animation: `fadeInUp 0.25s ease ${i * 0.04}s both`,
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{p.nombre}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>{p.prod_id}</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--muted)' }}>{formatPeso(p.precio)}</div>
                    <div style={{ marginTop: 8 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99,
                        background: 'var(--amber-bg)', color: 'var(--amber)',
                      }}>
                        Sin stock
                      </span>
                    </div>
                    {p.razon && (
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, lineHeight: 1.4 }}>
                        {p.razon}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
