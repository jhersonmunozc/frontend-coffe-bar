import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import type { Ingrediente } from '../../types/cafesino.types'

/* Schemas */
const schemaCrear = z.object({
  ing_id:   z.string().min(1, 'Requerido').regex(/^\S+$/, 'Sin espacios'),
  nombre:   z.string().min(2, 'Min 2 caracteres'),
  stock:    z.coerce.number().min(0, 'Min 0'),
  u_medida: z.enum(['ml', 'g', 'u']),
  minimo:   z.coerce.number().min(0, 'Min 0'),
})
const schemaEditar = schemaCrear.omit({ ing_id: true })
type FormCrear  = z.infer<typeof schemaCrear>
type FormEditar = z.infer<typeof schemaEditar>

const schemaStock = z.object({ cantidad: z.coerce.number().min(1, 'Min 1') })
type FormStock = z.infer<typeof schemaStock>

/* Estilos compartidos */
const INPUT: React.CSSProperties = {
  width: '100%', border: '1.5px solid var(--border)', borderRadius: 8,
  padding: '9px 12px', fontSize: 14, background: 'var(--bg)',
  color: 'var(--text)', outline: 'none', fontFamily: 'inherit',
}
const LABEL: React.CSSProperties = {
  display: 'block', fontSize: 12.5, fontWeight: 600,
  color: 'var(--muted)', marginBottom: 5,
}
const ERR: React.CSSProperties = { fontSize: 11.5, color: 'var(--red)', marginTop: 3 }

const BTN_PRIMARY: React.CSSProperties = {
  padding: '9px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
  background: 'var(--cafe)', color: '#fff', fontSize: 14, fontWeight: 600,
  fontFamily: 'inherit',
}
const BTN_SECONDARY: React.CSSProperties = {
  padding: '9px 16px', borderRadius: 8, cursor: 'pointer',
  background: 'transparent', border: '1.5px solid var(--border)',
  color: 'var(--muted)', fontSize: 14, fontWeight: 500, fontFamily: 'inherit',
}

function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--surface)', borderRadius: 18, padding: 28, width: 420, maxWidth: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

function ModalHeader({ title, subtitle, onClose }: { title: string; subtitle: string; onClose: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
      <div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{title}</h2>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>{subtitle}</p>
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 2 }}>
        <X size={18} />
      </button>
    </div>
  )
}

/* Modal Crear */
interface CrearProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: FormCrear) => void
  isPending: boolean
  isError: boolean
}
export function ModalCrearIngrediente({ isOpen, onClose, onSubmit, isPending, isError }: CrearProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormCrear>({ resolver: zodResolver(schemaCrear) })
  if (!isOpen) return null
  return (
    <Overlay onClose={onClose}>
      <ModalHeader title="Nuevo ingrediente" subtitle="Completa los datos del ingrediente" onClose={onClose} />
      <form onSubmit={handleSubmit((d) => { onSubmit(d); reset() })} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={LABEL}>Nombre del ingrediente</label>
          <input {...register('nombre')} placeholder="ej. Cafe molido" style={INPUT} onFocus={(e) => (e.target.style.borderColor = 'var(--cafe)')} onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
          {errors.nombre && <p style={ERR}>{errors.nombre.message}</p>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={LABEL}>Stock actual</label>
            <input {...register('stock')} type="number" min="0" placeholder="0" style={INPUT} onFocus={(e) => (e.target.style.borderColor = 'var(--cafe)')} onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
            {errors.stock && <p style={ERR}>{errors.stock.message}</p>}
          </div>
          <div>
            <label style={LABEL}>Unidad</label>
            <select {...register('u_medida')} style={{ ...INPUT, appearance: 'none' }}>
              <option value="">Seleccionar</option>
              <option value="g">g (gramos)</option>
              <option value="ml">ml (mililitros)</option>
              <option value="u">u (unidades)</option>
            </select>
            {errors.u_medida && <p style={ERR}>{errors.u_medida.message}</p>}
          </div>
          <div>
            <label style={LABEL}>Stock minimo</label>
            <input {...register('minimo')} type="number" min="0" placeholder="0" style={INPUT} onFocus={(e) => (e.target.style.borderColor = 'var(--cafe)')} onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
            {errors.minimo && <p style={ERR}>{errors.minimo.message}</p>}
          </div>
          <div>
            <label style={LABEL}>ID del ingrediente</label>
            <input {...register('ing_id')} placeholder="ej. cafe-001" style={INPUT} onFocus={(e) => (e.target.style.borderColor = 'var(--cafe)')} onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
            {errors.ing_id && <p style={ERR}>{errors.ing_id.message}</p>}
          </div>
        </div>
        {isError && <p style={ERR}>Error al guardar. Verifica que el ID no exista.</p>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
          <button type="button" onClick={onClose} style={BTN_SECONDARY}>Cancelar</button>
          <button type="submit" disabled={isPending} style={BTN_PRIMARY}>{isPending ? 'Guardando...' : 'Guardar ingrediente'}</button>
        </div>
      </form>
    </Overlay>
  )
}

/* Modal Editar */
interface EditarProps {
  ing: Ingrediente | null
  onClose: () => void
  onSubmit: (ing_id: string, data: FormEditar) => void
  isPending: boolean
  isError: boolean
}
export function ModalEditarIngrediente({ ing, onClose, onSubmit, isPending, isError }: EditarProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormEditar>({ resolver: zodResolver(schemaEditar) })
  useEffect(() => {
    if (ing) reset({ nombre: ing.nombre, stock: ing.stock, u_medida: ing.u_medida, minimo: ing.minimo })
  }, [ing, reset])
  if (!ing) return null
  return (
    <Overlay onClose={onClose}>
      <ModalHeader title="Editar ingrediente" subtitle={`Modificando: ${ing.nombre}`} onClose={onClose} />
      <form onSubmit={handleSubmit((d) => onSubmit(ing.ing_id, d))} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={LABEL}>Nombre</label>
          <input {...register('nombre')} style={INPUT} onFocus={(e) => (e.target.style.borderColor = 'var(--cafe)')} onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
          {errors.nombre && <p style={ERR}>{errors.nombre.message}</p>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={LABEL}>Stock actual</label>
            <input {...register('stock')} type="number" min="0" style={INPUT} onFocus={(e) => (e.target.style.borderColor = 'var(--cafe)')} onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
            {errors.stock && <p style={ERR}>{errors.stock.message}</p>}
          </div>
          <div>
            <label style={LABEL}>Unidad</label>
            <select {...register('u_medida')} style={{ ...INPUT, appearance: 'none' }}>
              <option value="g">g (gramos)</option>
              <option value="ml">ml (mililitros)</option>
              <option value="u">u (unidades)</option>
            </select>
          </div>
          <div>
            <label style={LABEL}>Stock minimo</label>
            <input {...register('minimo')} type="number" min="0" style={INPUT} onFocus={(e) => (e.target.style.borderColor = 'var(--cafe)')} onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
            {errors.minimo && <p style={ERR}>{errors.minimo.message}</p>}
          </div>
        </div>
        {isError && <p style={ERR}>Error al actualizar.</p>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
          <button type="button" onClick={onClose} style={BTN_SECONDARY}>Cancelar</button>
          <button type="submit" disabled={isPending} style={BTN_PRIMARY}>{isPending ? 'Guardando...' : 'Guardar cambios'}</button>
        </div>
      </form>
    </Overlay>
  )
}

/* Modal +Stock */
interface StockProps {
  ing: Ingrediente | null
  onClose: () => void
  onSubmit: (ing_id: string, cantidad: number) => void
  isPending: boolean
}
export function ModalAgregarStock({ ing, onClose, onSubmit, isPending }: StockProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormStock>({ resolver: zodResolver(schemaStock) })
  useEffect(() => { if (ing) reset({ cantidad: 0 }) }, [ing, reset])
  if (!ing) return null
  return (
    <Overlay onClose={onClose}>
      <ModalHeader title="Agregar stock" subtitle={`Ingrediente: ${ing.nombre} | Stock actual: ${ing.stock} ${ing.u_medida}`} onClose={onClose} />
      <form onSubmit={handleSubmit((d) => onSubmit(ing.ing_id, d.cantidad))} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={LABEL}>Cantidad a agregar</label>
          <input {...register('cantidad')} type="number" min="1" autoFocus style={INPUT} onFocus={(e) => (e.target.style.borderColor = 'var(--cafe)')} onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
          {errors.cantidad && <p style={ERR}>{errors.cantidad.message}</p>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" onClick={onClose} style={BTN_SECONDARY}>Cancelar</button>
          <button type="submit" disabled={isPending} style={{ ...BTN_PRIMARY, background: 'var(--green)' }}>{isPending ? 'Agregando...' : 'Agregar stock'}</button>
        </div>
      </form>
    </Overlay>
  )
}

/* Confirm Eliminar */
interface EliminarProps {
  ing: Ingrediente | null
  onClose: () => void
  onConfirm: (ing_id: string) => void
  isPending: boolean
}
export function ModalEliminarIngrediente({ ing, onClose, onConfirm, isPending }: EliminarProps) {
  if (!ing) return null
  return (
    <Overlay onClose={onClose}>
      <ModalHeader title="Eliminar ingrediente" subtitle="Esta accion no se puede deshacer" onClose={onClose} />
      <p style={{ fontSize: 14, color: 'var(--text)', marginBottom: 22 }}>
        ¿Seguro que deseas eliminar <strong>{ing.nombre}</strong>?
      </p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button onClick={onClose} style={BTN_SECONDARY}>Cancelar</button>
        <button onClick={() => onConfirm(ing.ing_id)} disabled={isPending} style={{ ...BTN_PRIMARY, background: 'var(--red)' }}>
          {isPending ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>
    </Overlay>
  )
}
