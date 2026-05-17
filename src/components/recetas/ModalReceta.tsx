import { useState, useEffect } from 'react'
import { X, Plus, Trash2, ChevronRight, ChevronLeft, ImageOff } from 'lucide-react'
import type { Ingrediente } from '../../types/cafesino.types'
import type { NuevoIngredienteForm, CrearRecetaPayload } from '../../hooks/useRecetas'

const CATEGORIAS = ['Comida', 'Bebida', 'Postre', 'Especial']

const INPUT: React.CSSProperties = {
  width: '100%', border: '1.5px solid var(--border)', borderRadius: 8,
  padding: '9px 12px', fontSize: 14, background: 'var(--bg)',
  color: 'var(--text)', outline: 'none', fontFamily: 'inherit',
}
const LABEL: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 5 }
const ERR:   React.CSSProperties = { fontSize: 11.5, color: 'var(--red)', marginTop: 3 }
const BTN_P: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 8,
  border: 'none', cursor: 'pointer', background: 'var(--cafe)', color: '#fff',
  fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
}
const BTN_S: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, cursor: 'pointer',
  background: 'transparent', border: '1.5px solid var(--border)', color: 'var(--muted)',
  fontSize: 14, fontWeight: 500, fontFamily: 'inherit',
}

interface IngRow extends NuevoIngredienteForm {}

const emptyRow = (): IngRow => ({
  ing_id: '', nombre: '', stock: 0, u_medida: 'g', minimo: 0, cantidad: 0, esNuevo: false,
})

interface Props {
  isOpen:         boolean
  onClose:        () => void
  onSubmit:       (p: CrearRecetaPayload) => void
  isPending:      boolean
  isError:        boolean
  ingredientes:   Ingrediente[]   // ingredientes existentes para ayuda
  errorMessage?:  string
}

export function ModalReceta({ isOpen, onClose, onSubmit, isPending, isError, ingredientes, errorMessage }: Props) {
  const [step, setStep] = useState(1)

  // Paso 1 ? producto
  const [prod, setProd] = useState({ prod_id: '', nombre: '', categoria: 'Bebida', precio: '', imagen_url: '' })
  const [errProd, setErrProd] = useState<Record<string, string>>({})

  // Paso 2 ? ingredientes
  const [rows, setRows] = useState<IngRow[]>([emptyRow()])
  const [errIng, setErrIng] = useState('')

  useEffect(() => {
    if (!isOpen) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) { setStep(1); setProd({ prod_id: '', nombre: '', categoria: 'Bebida', precio: '', imagen_url: '' }); setRows([emptyRow()]); setErrProd({}); setErrIng('') }
  }, [isOpen])

  if (!isOpen) return null

  const setP = (k: string, v: string) => setProd((p) => ({ ...p, [k]: v }))

  const validateStep1 = () => {
    const e: Record<string, string> = {}
    if (!prod.prod_id.trim())  e.prod_id = 'Requerido (ej. P007)'
    if (!prod.nombre.trim())   e.nombre  = 'Requerido'
    if (!prod.precio || +prod.precio <= 0) e.precio = 'Debe ser mayor a 0'
    setErrProd(e)
    return Object.keys(e).length === 0
  }

  const validateStep2 = () => {
    if (rows.length === 0) { setErrIng('Agrega al menos un ingrediente'); return false }
    for (const r of rows) {
      if (!r.ing_id.trim()) { setErrIng('Todos los ingredientes deben tener ID'); return false }
      if (r.cantidad <= 0)  { setErrIng('Las cantidades deben ser mayores a 0'); return false }
      if (r.esNuevo && !r.nombre.trim()) { setErrIng('Los ingredientes nuevos necesitan nombre'); return false }
    }
    setErrIng('')
    return true
  }

  const updateRow = (idx: number, field: keyof IngRow, val: string | number | boolean) => {
    setRows((rs) => rs.map((r, i) => i === idx ? { ...r, [field]: val } : r))
  }

  const selectExistente = (idx: number, ing_id: string) => {
    const ing = ingredientes.find((i) => i.ing_id === ing_id)
    if (ing) {
      setRows((rs) => rs.map((r, i) => i === idx ? { ...r, ing_id: ing.ing_id, nombre: ing.nombre, u_medida: ing.u_medida, minimo: ing.minimo, stock: ing.stock, esNuevo: false } : r))
    } else {
      setRows((rs) => rs.map((r, i) => i === idx ? { ...r, ing_id, esNuevo: true } : r))
    }
  }

  const handleSubmit = () => {
    if (!validateStep2()) return
    onSubmit({
      prod_id:     prod.prod_id.trim(),
      nombre:      prod.nombre.trim(),
      categoria:   prod.categoria,
      precio:      Math.round(Number(prod.precio)),
      imagen_url:  prod.imagen_url.trim(),
      ingredientes: rows,
    })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: 'var(--surface)', borderRadius: 18, padding: 28, width: 520, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
              Nueva receta
            </h2>
            <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>
              {step === 1 ? 'Paso 1 de 2 ? Datos del producto' : 'Paso 2 de 2 ? Ingredientes'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Indicador de pasos */}
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2].map((s) => (
                <div key={s} style={{ width: 28, height: 4, borderRadius: 99, background: step >= s ? 'var(--cafe)' : 'var(--border)' }} />
              ))}
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 2 }}><X size={18} /></button>
          </div>
        </div>

        {/* PASO 1 */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={LABEL}>ID del producto *</label>
                <input value={prod.prod_id} onChange={(e) => setP('prod_id', e.target.value)} placeholder="ej. P007" style={errProd.prod_id ? { ...INPUT, borderColor: 'var(--red)' } : INPUT} onFocus={(e) => (e.target.style.borderColor = 'var(--cafe)')} onBlur={(e) => (e.target.style.borderColor = errProd.prod_id ? 'var(--red)' : 'var(--border)')} />
                {errProd.prod_id && <p style={ERR}>{errProd.prod_id}</p>}
              </div>
              <div>
                <label style={LABEL}>Categoria *</label>
                <select value={prod.categoria} onChange={(e) => setP('categoria', e.target.value)} style={{ ...INPUT, appearance: 'none' }}>
                  {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={LABEL}>Nombre del producto *</label>
              <input value={prod.nombre} onChange={(e) => setP('nombre', e.target.value)} placeholder="ej. Latte de vainilla" style={errProd.nombre ? { ...INPUT, borderColor: 'var(--red)' } : INPUT} onFocus={(e) => (e.target.style.borderColor = 'var(--cafe)')} onBlur={(e) => (e.target.style.borderColor = errProd.nombre ? 'var(--red)' : 'var(--border)')} />
              {errProd.nombre && <p style={ERR}>{errProd.nombre}</p>}
            </div>

            <div>
              <label style={LABEL}>Precio (COP) *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 14, pointerEvents: 'none' }}>$</span>
                <input value={prod.precio} onChange={(e) => setP('precio', e.target.value)} type="number" min="0" step="100" placeholder="0" style={{ ...(errProd.precio ? { ...INPUT, borderColor: 'var(--red)' } : INPUT), paddingLeft: 24 }} onFocus={(e) => (e.target.style.borderColor = 'var(--cafe)')} onBlur={(e) => (e.target.style.borderColor = errProd.precio ? 'var(--red)' : 'var(--border)')} />
              </div>
              {errProd.precio && <p style={ERR}>{errProd.precio}</p>}
            </div>

            <div>
              <label style={LABEL}>URL de imagen</label>
              <input value={prod.imagen_url} onChange={(e) => setP('imagen_url', e.target.value)} placeholder="https://... o dejar vacío" style={INPUT} onFocus={(e) => (e.target.style.borderColor = 'var(--cafe)')} onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
              {prod.imagen_url && (
                <div style={{ marginTop: 8, width: 72, height: 72, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
                  <img src={prod.imagen_url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex' }} />
                  <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', color: 'var(--muted)', fontSize: 10 }}><ImageOff size={18} /><span>Sin imagen</span></div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
              <button onClick={onClose} style={BTN_S}>Cancelar</button>
              <button onClick={() => { if (validateStep1()) setStep(2) }} style={BTN_P}>Siguiente <ChevronRight size={16} /></button>
            </div>
          </div>
        )}

        {/* PASO 2 */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
              Define los ingredientes de <strong style={{ color: 'var(--text)' }}>{prod.nombre}</strong>. Selecciona un ingrediente existente o marca "Nuevo" para crearlo.
            </p>

            {/* Filas de ingredientes */}
            {rows.map((row, idx) => (
              <div key={idx} style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)' }}>Ingrediente {idx + 1}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--muted)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={row.esNuevo} onChange={(e) => updateRow(idx, 'esNuevo', e.target.checked)} style={{ accentColor: 'var(--cafe)' }} />
                      Ingrediente nuevo
                    </label>
                    {rows.length > 1 && (
                      <button onClick={() => setRows((rs) => rs.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 2 }}><Trash2 size={14} /></button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: row.esNuevo ? '1fr 1fr' : '1fr 1fr', gap: 10 }}>
                  {/* Selector de ingrediente existente */}
                  {!row.esNuevo ? (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={LABEL}>Ingrediente</label>
                      <select value={row.ing_id} onChange={(e) => selectExistente(idx, e.target.value)} style={{ ...INPUT, appearance: 'none' }}>
                        <option value="">-- Seleccionar --</option>
                        {ingredientes.map((i) => (
                          <option key={i.ing_id} value={i.ing_id}>{i.nombre} ({i.u_medida})</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label style={LABEL}>ID nuevo *</label>
                        <input value={row.ing_id} onChange={(e) => updateRow(idx, 'ing_id', e.target.value)} placeholder="ej. ing-010" style={INPUT} />
                      </div>
                      <div>
                        <label style={LABEL}>Nombre *</label>
                        <input value={row.nombre} onChange={(e) => updateRow(idx, 'nombre', e.target.value)} placeholder="ej. Canela" style={INPUT} />
                      </div>
                      <div>
                        <label style={LABEL}>Unidad</label>
                        <select value={row.u_medida} onChange={(e) => updateRow(idx, 'u_medida', e.target.value)} style={{ ...INPUT, appearance: 'none' }}>
                          <option value="g">g</option>
                          <option value="ml">ml</option>
                          <option value="u">u</option>
                        </select>
                      </div>
                      <div>
                        <label style={LABEL}>Stock inicial</label>
                        <input
                          value={row.stock === 0 ? '' : row.stock}
                          onChange={(e) => updateRow(idx, 'stock', e.target.value === '' ? 0 : +e.target.value)}
                          type="text" inputMode="numeric" pattern="[0-9]*"
                          placeholder="0" style={INPUT}
                        />
                      </div>
                      <div>
                        <label style={LABEL}>Stock minimo</label>
                        <input
                          value={row.minimo === 0 ? '' : row.minimo}
                          onChange={(e) => updateRow(idx, 'minimo', e.target.value === '' ? 0 : +e.target.value)}
                          type="text" inputMode="numeric" pattern="[0-9]*"
                          placeholder="0" style={INPUT}
                        />
                      </div>
                    </>
                  )}

                  {/* Cantidad ? siempre visible */}
                  <div>
                    <label style={LABEL}>Cantidad ({row.esNuevo ? row.u_medida || 'g' : row.u_medida || '?'}) *</label>
                    <input
                      value={row.cantidad === 0 ? '' : row.cantidad}
                      onChange={(e) => updateRow(idx, 'cantidad', e.target.value === '' ? 0 : +e.target.value)}
                      type="text" inputMode="decimal" pattern="[0-9]*[.,]?[0-9]*"
                      placeholder="0" style={INPUT}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button onClick={() => setRows((rs) => [...rs, emptyRow()])} style={{ ...BTN_S, justifyContent: 'center' }}>
              <Plus size={14} /> Agregar ingrediente
            </button>

            {errIng  && <p style={ERR}>{errIng}</p>}
            {isError && <p style={ERR}>{errorMessage ?? 'Error al crear. Verifica que los IDs no existan.'}</p>}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 6 }}>
              <button onClick={() => setStep(1)} style={BTN_S}><ChevronLeft size={16} /> Atras</button>
              <button onClick={handleSubmit} disabled={isPending} style={BTN_P}>
                {isPending ? 'Creando...' : 'Crear producto y receta'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
