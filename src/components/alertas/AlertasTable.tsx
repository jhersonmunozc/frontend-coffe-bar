import { Search, ArrowUpDown, Check, Trash2, BellOff } from 'lucide-react'
import type { AlertaLocal } from '../../context/AlertasContext'

const FMT = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit', hour12: true,
})

const NIVEL_CFG = {
  bajo:    { bg: 'var(--amber-bg)', color: 'var(--amber)',   label: 'Bajo'    },
  agotado: { bg: '#F3E5F5',        color: '#6A1B9A',         label: 'Agotado' },
  critico: { bg: 'var(--red-bg)',  color: 'var(--red)',      label: 'Critico' },
} as const

const VISTO_CFG = {
  pendiente: { bg: 'var(--amber-bg)', color: 'var(--amber)', label: 'Pendiente' },
  resuelto:  { bg: 'var(--green-bg)', color: 'var(--green)', label: 'Resuelto'  },
} as const

const FILTROS = [
  { key: 'todos',   label: 'Todos' },
  { key: 'bajo',    label: 'Bajo' },
  { key: 'agotado', label: 'Agotado' },
  { key: 'critico', label: 'Critico' },
] as const

const TH: React.CSSProperties = {
  fontSize: 10.5, fontWeight: 700, color: 'var(--muted)',
  textTransform: 'uppercase', letterSpacing: '0.8px',
  padding: '11px 16px', textAlign: 'left',
}

interface Props {
  filteredAlertas:   AlertaLocal[]
  allFilteredCount:  number
  alertasTotal:      number
  currentPage:       number
  totalPages:        number
  pageSize:          number
  searchQuery:       string
  setSearchQuery:    (v: string) => void
  filtroNivel:       'todos' | 'bajo' | 'agotado' | 'critico'
  setFiltroNivel:    (v: 'todos' | 'bajo' | 'agotado' | 'critico') => void
  sortOrder:         'asc' | 'desc'
  toggleSortOrder:   () => void
  setCurrentPage:    (n: number) => void
  marcarResuelto:    (id: string) => void
  eliminarAlerta:    (id: string) => void
}

export function AlertasTable({
  filteredAlertas, allFilteredCount, alertasTotal,
  currentPage, totalPages, pageSize,
  searchQuery, setSearchQuery, filtroNivel, setFiltroNivel,
  sortOrder, toggleSortOrder, setCurrentPage,
  marcarResuelto, eliminarAlerta,
}: Props) {

  const desde = allFilteredCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const hasta  = Math.min(currentPage * pageSize, allFilteredCount)

  const iconBtn = (active = false): React.CSSProperties => ({
    width: 30, height: 30, borderRadius: 7,
    border: `1px solid ${active ? 'var(--border)' : 'var(--border)'}`,
    background: 'transparent', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    color: 'var(--muted)', transition: 'all 0.14s',
  })

  const handleDelete = (id: string) => {
    if (window.confirm('Eliminar esta alerta? Esta accion no se puede deshacer.')) {
      eliminarAlerta(id)
    }
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>

      {/* Card header */}
      <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>Historial de alertas</span>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Buscador */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '6px 11px', width: 200 }}>
            <Search size={13} style={{ color: 'var(--muted)', flexShrink: 0 }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar mensaje o ingrediente..."
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12.5, color: 'var(--text)', width: '100%', fontFamily: 'inherit' }}
            />
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', padding: 3, gap: 2 }}>
            {FILTROS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFiltroNivel(f.key as typeof filtroNivel)}
                style={{
                  padding: '4px 11px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.14s',
                  background: filtroNivel === f.key ? 'var(--cafe)' : 'transparent',
                  color:      filtroNivel === f.key ? '#fff' : 'var(--muted)',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--bg)' }}>
            <tr>
              <th style={{ ...TH, cursor: 'pointer', userSelect: 'none' }} onClick={toggleSortOrder}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Fecha <ArrowUpDown size={11} style={{ color: 'var(--muted)' }} />
                  <span style={{ fontSize: 10, color: 'var(--cafe)' }}>{sortOrder === 'desc' ? '?' : '?'}</span>
                </span>
              </th>
              {['Ingrediente', 'Nivel', 'Mensaje', 'Estado', 'Acciones'].map((h) => (
                <th key={h} style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAlertas.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '40px 0', color: 'var(--muted)' }}>
                    <BellOff size={28} style={{ opacity: 0.35 }} />
                    <span style={{ fontSize: 13 }}>No hay alertas que coincidan</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAlertas.map((a, idx) => {
                const nivelCfg = NIVEL_CFG[a.nivel]
                const vistoCfg = VISTO_CFG[a.visto]
                const resuelta = a.visto === 'resuelto'
                return (
                  <tr
                    key={a.id}
                    style={{ borderTop: '1px solid var(--border)', animation: 'fadeInRow 0.18s ease both', animationDelay: `${idx * 25}ms` }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Fecha */}
                    <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                      {FMT.format(new Date(a.fecha))}
                    </td>
                    {/* Ingrediente */}
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>{a.ingredienteId}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{a.ingrediente}</div>
                    </td>
                    {/* Nivel */}
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: nivelCfg.bg, color: nivelCfg.color, borderRadius: 99, padding: '3px 10px', fontSize: 11.5, fontWeight: 600 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: nivelCfg.color, flexShrink: 0 }} />
                        {nivelCfg.label}
                      </span>
                    </td>
                    {/* Mensaje */}
                    <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--text)', maxWidth: 280 }}>
                      {a.mensaje}
                    </td>
                    {/* Estado */}
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ display: 'inline-block', background: vistoCfg.bg, color: vistoCfg.color, borderRadius: 6, padding: '3px 10px', fontSize: 11.5, fontWeight: 600 }}>
                        {vistoCfg.label}
                      </span>
                    </td>
                    {/* Acciones */}
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          title="Marcar resuelto"
                          disabled={resuelta}
                          onClick={() => marcarResuelto(a.id)}
                          style={{ ...iconBtn(), opacity: resuelta ? 0.4 : 1, cursor: resuelta ? 'not-allowed' : 'pointer' }}
                          onMouseEnter={(e) => { if (!resuelta) { e.currentTarget.style.background = 'var(--green-bg)'; e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)' } }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
                        ><Check size={14} /></button>
                        <button
                          title="Eliminar"
                          onClick={() => handleDelete(a.id)}
                          style={iconBtn()}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--red-bg)'; e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
                        ><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginacion */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          {allFilteredCount === 0 ? 'Sin resultados' : `Mostrando ${desde}–${hasta} de ${allFilteredCount} alerta${allFilteredCount !== 1 ? 's' : ''}`}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {/* Anterior */}
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', opacity: currentPage === 1 ? 0.4 : 1 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>

          {/* Numerados */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${p === currentPage ? 'var(--cafe)' : 'var(--border)'}`, background: p === currentPage ? 'var(--cafe)' : 'transparent', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: p === currentPage ? '#fff' : 'var(--muted)', fontFamily: 'inherit' }}
            >{p}</button>
          ))}

          {/* Siguiente */}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', opacity: currentPage === totalPages ? 0.4 : 1 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
