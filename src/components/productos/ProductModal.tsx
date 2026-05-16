import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { Producto } from '../../types/cafesino.types'
import { ToggleSwitch } from '../shared/ToggleSwitch'

const CATEGORIAS = ['Comida', 'Bebida', 'Postre', 'Especial'] as const
type Cat = typeof CATEGORIAS[number]

const CATEG_CFG: Record<Cat, { bg: string; color: string }> = {
  Comida:  { bg: '#FFF3E0', color: '#E65100' },
  Bebida:  { bg: '#E3F2FD', color: '#0D47A1' },
  Postre:  { bg: '#FCE4EC', color: '#880E4F' },
  Especial:{ bg: '#F3E5F5', color: '#4A148C' },
}

const INPUT_BASE: React.CSSProperties = {
  width: '100%', border: '1.5px solid var(--border)', borderRadius: 8,
  padding: '9px 12px', fontSize: 14, background: 'var(--bg)',
  color: 'var(--text)', outline: 'none', fontFamily: 'inherit',
}
const INPUT_ERR: React.CSSProperties = { ...INPUT_BASE, borderColor: 'var(--red)' }
const LABEL: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 5 }
const ERR:   React.CSSProperties = { fontSize: 11.5, color: 'var(--red)', marginTop: 3 }
const BTN_P: React.CSSProperties = {
  padding: '9px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
  background: 'var(--cafe)', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
}
const BTN_S: React.CSSProperties = {
  padding: '9px 16px', borderRadius: 8, cursor: 'pointer',
  background: 'transparent', border: '1.5px solid var(--border)',
  color: 'var(--muted)', fontSize: 14, fontWeight: 500, fontFamily: 'inherit',
}

interface FormState { nombre: string; categoria: Cat; precio: string; disponible: boolean; imagen_url: string }
interface Errors    { nombre?: string; precio?: string }

function validate(f: FormState): Errors {
  const e: Errors = {}
  if (!f.nombre.trim())             e.nombre = 'El nombre es requerido'
  if (!f.precio || +f.precio <= 0)  e.precio = 'El precio debe ser mayor a 0'
  return e
}

interface ModalProductoProps {
  producto: Producto | null      // null = crear, objeto = editar
  isOpen:   boolean
  onClose:  () => void
  onSubmit: (data: Omit<Producto, '_id' | 'prod_id'> & { prod_id?: string }) => void
  isPending: boolean
  isError:   boolean
}

export function ModalProducto({ producto, isOpen, onClose, onSubmit, isPending, isError }: ModalProductoProps) {
  const [form,   setForm]   = useState<FormState>({ nombre: '', categoria: 'Bebida', precio: '', disponible: true, imagen_url: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [prodId, setProdId] = useState('')

  useEffect(() => {
    if (producto) {
      setForm({ nombre: producto.nombre, categoria: producto.categoria as Cat, precio: String(producto.precio), disponible: producto.disponible, imagen_url: producto.imagen_url ?? '' })
      setProdId(producto.prod_id)
    } else {
      setForm({ nombre: '', categoria: 'Bebida', precio: '', disponible: true, imagen_url: '' })
      setProdId('')
    }
    setErrors({})
  }, [producto, isOpen])

  useEffect(() => {
    if (!isOpen) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const set = (k: keyof FormState, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSubmit({ ...(!producto ? { prod_id: prodId || undefined } : {}), nombre: form.nombre.trim(), categoria: form.categoria, precio: Math.round(Number(form.precio)), disponible: form.disponible, imagen_url: form.imagen_url.trim() })
  }

  const isEditar = !!producto
  const catCfg   = CATEG_CFG[form.categoria]

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div style={{ background: 'var(--surface)', borderRadius: 18, padding: 28, width: 420, maxWidth: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
              {isEditar ? 'Editar producto' : 'Nuevo producto'}
            </h2>
            <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>
              {isEditar ? `Modificando: ${producto.nombre}` : 'Completa los datos del producto'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 2 }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Nombre */}
          <div>
            <label style={LABEL}>Nombre del producto</label>
            <input value={form.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="ej. Latte de vainilla"
              style={errors.nombre ? INPUT_ERR : INPUT_BASE}
              onFocus={(e) => (e.target.style.borderColor = 'var(--cafe)')} onBlur={(e) => (e.target.style.borderColor = errors.nombre ? 'var(--red)' : 'var(--border)')} />
            {errors.nombre && <p style={ERR}>{errors.nombre}</p>}
          </div>

          {/* Categor?a */}
          <div>
            <label style={LABEL}>Categoria</label>
            <select value={form.categoria} onChange={(e) => set('categoria', e.target.value)} style={{ ...INPUT_BASE, appearance: 'none' }}>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {/* Preview badge */}
            <div style={{ marginTop: 6 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', background: catCfg.bg, color: catCfg.color, borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                {form.categoria}
              </span>
            </div>
          </div>

          {/* Precio + ID en grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={LABEL}>Precio (COP)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 14, pointerEvents: 'none' }}>$</span>
                <input value={form.precio} onChange={(e) => set('precio', e.target.value)} type="number" min="0" step="100" placeholder="0"
                  style={{ ...(errors.precio ? INPUT_ERR : INPUT_BASE), paddingLeft: 24 }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--cafe)')} onBlur={(e) => (e.target.style.borderColor = errors.precio ? 'var(--red)' : 'var(--border)')} />
              </div>
              {errors.precio && <p style={ERR}>{errors.precio}</p>}
            </div>
            {!isEditar && (
              <div>
                <label style={LABEL}>ID (opcional)</label>
                <input value={prodId} onChange={(e) => setProdId(e.target.value)} placeholder="ej. P007"
                  style={INPUT_BASE}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--cafe)')} onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
              </div>
            )}
          </div>

          {/* URL imagen */}
          <div>
            <label style={LABEL}>URL de imagen (opcional)</label>
            <input value={form.imagen_url} onChange={(e) => set('imagen_url', e.target.value)} placeholder="https://..."
              style={INPUT_BASE}
              onFocus={(e) => (e.target.style.borderColor = 'var(--cafe)')} onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
          </div>

          {/* Disponible */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg)', borderRadius: 8 }}>
            <ToggleSwitch checked={form.disponible} onChange={() => set('disponible', !form.disponible)} />
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>Marcar como disponible en el catalogo</span>
          </div>

          {isError && <p style={ERR}>Error al guardar. Verifica que el ID no exista.</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
            <button type="button" onClick={onClose} style={BTN_S}>Cancelar</button>
            <button type="submit" disabled={isPending} style={BTN_P}>{isPending ? 'Guardando...' : isEditar ? 'Guardar cambios' : 'Crear producto'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ?? Confirm eliminar ?? */
interface ConfirmEliminarProps {
  producto: Producto | null
  onClose:  () => void
  onConfirm:(id: string) => void
  isPending: boolean
}

export function ModalEliminarProducto({ producto, onClose, onConfirm, isPending }: ConfirmEliminarProps) {
  useEffect(() => {
    if (!producto) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [producto, onClose])

  if (!producto) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: 'var(--surface)', borderRadius: 18, padding: 28, width: 400, maxWidth: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Eliminar producto</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}><X size={18} /></button>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text)', marginBottom: 8 }}>
          Seguro que deseas eliminar <strong>{producto.nombre}</strong>?
        </p>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 22 }}>
          No se puede eliminar si tiene una receta asociada.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={BTN_S}>Cancelar</button>
          <button onClick={() => onConfirm(producto.prod_id)} disabled={isPending}
            style={{ ...BTN_P, background: 'var(--red)' }}>
            {isPending ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
