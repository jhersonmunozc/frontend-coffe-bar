import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, PlusCircle } from 'lucide-react'
import {
  getIngredientes,
  crearIngrediente,
  editarIngrediente,
  agregarStock,
  eliminarIngrediente,
} from '../../api/ingredientesApi'
import type { Ingrediente } from '../../types/cafesino.types'
import { Modal }  from '../../components/ui/Modal'
import { Badge }  from '../../components/ui/Badge'

/* ?? Zod schemas ?? */
const schemaIngrediente = z.object({
  ing_id:   z.string().min(1, 'Requerido').regex(/^\S+$/, 'Sin espacios'),
  nombre:   z.string().min(2, 'Min 2 caracteres'),
  stock:    z.coerce.number().min(0, 'Min 0'),
  u_medida: z.enum(['ml', 'g', 'u'], { errorMap: () => ({ message: 'Selecciona unidad' }) }),
  minimo:   z.coerce.number().min(0, 'Min 0'),
})
type FormIngrediente = z.infer<typeof schemaIngrediente>

const schemaStock = z.object({
  cantidad: z.coerce.number().min(1, 'Min 1'),
})
type FormStock = z.infer<typeof schemaStock>

/* ?? Campo reutilizable ?? */
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

const INPUT = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-orange-400 transition-colors"
const BTN_PRIMARY = "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-85"
const BTN_DANGER  = "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-500 transition-opacity hover:opacity-85"

export default function IngredientesPage() {
  const qc = useQueryClient()
  const { data: ingredientes = [], isLoading, isError, error, refetch } = useQuery({ queryKey: ['ingredientes'], queryFn: getIngredientes })

  /* modales */
  const [modalCrear,  setModalCrear]  = useState(false)
  const [modalEditar, setModalEditar] = useState<Ingrediente | null>(null)
  const [modalStock,  setModalStock]  = useState<Ingrediente | null>(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState<Ingrediente | null>(null)

  /* mutations */
  const invalidar = () => qc.invalidateQueries({ queryKey: ['ingredientes'] })

  const mutCrear = useMutation({
    mutationFn: crearIngrediente,
    onSuccess: () => { invalidar(); setModalCrear(false) },
  })
  const mutEditar = useMutation({
    mutationFn: ({ ing_id, datos }: { ing_id: string; datos: Partial<Omit<Ingrediente, '_id' | 'ing_id'>> }) =>
      editarIngrediente(ing_id, datos),
    onSuccess: () => { invalidar(); setModalEditar(null) },
  })
  const mutStock = useMutation({
    mutationFn: ({ ing_id, cantidad }: { ing_id: string; cantidad: number }) => agregarStock(ing_id, cantidad),
    onSuccess: () => { invalidar(); setModalStock(null) },
  })
  const mutEliminar = useMutation({
    mutationFn: (ing_id: string) => eliminarIngrediente(ing_id),
    onSuccess: () => { invalidar(); setConfirmarEliminar(null) },
  })

  /* forms */
  const formCrear = useForm<FormIngrediente>({ resolver: zodResolver(schemaIngrediente) })
  const formEditar = useForm<FormIngrediente>({ resolver: zodResolver(schemaIngrediente) })
  const formStock  = useForm<FormStock>({ resolver: zodResolver(schemaStock) })

  const abrirEditar = (ing: Ingrediente) => {
    formEditar.reset({ ing_id: ing.ing_id, nombre: ing.nombre, stock: ing.stock, u_medida: ing.u_medida, minimo: ing.minimo })
    setModalEditar(ing)
  }

  const estadoBadge = (ing: Ingrediente) =>
    ing.stock === 0 ? 'red' : ing.stock <= ing.minimo ? 'yellow' : 'green'
  const estadoLabel = (ing: Ingrediente) =>
    ing.stock === 0 ? 'Agotado' : ing.stock <= ing.minimo ? 'Critico' : 'OK'

  return (
    <div className="max-w-6xl mx-auto">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bold leading-none" style={{ fontSize: 28, color: '#1a1a2e', fontFamily: "'Playfair Display', serif" }}>
            Ingredientes
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#6b7280' }}>Gestion de inventario</p>
        </div>
        <button
          onClick={() => { formCrear.reset(); setModalCrear(true) }}
          className={BTN_PRIMARY}
          style={{ background: '#af4c0f' }}
        >
          <Plus size={16} /> Nuevo ingrediente
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Cargando ingredientes...</div>
        ) : isError ? (
          <div className="p-10 text-center">
            <p className="text-red-500 text-sm font-semibold mb-1">No se pudo cargar el listado</p>
            <p className="text-xs text-gray-400 mb-4">{(error as Error)?.message ?? 'Error de conexion'}</p>
            <button onClick={() => refetch()} className="px-4 py-2 rounded-lg text-sm text-white font-semibold" style={{ background: '#af4c0f' }}>
              Reintentar
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                  {['ID', 'Nombre', 'Stock', 'Unidad', 'Minimo', 'Estado', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3 font-semibold uppercase tracking-wider" style={{ fontSize: 11, color: '#9ca3af' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ingredientes.map((ing) => (
                  <tr key={ing.ing_id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{ing.ing_id}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">{ing.nombre}</td>
                    <td className="px-5 py-3.5 font-bold" style={{ color: ing.stock <= ing.minimo ? '#dc2626' : '#111827' }}>{ing.stock}</td>
                    <td className="px-5 py-3.5 text-gray-500">{ing.u_medida}</td>
                    <td className="px-5 py-3.5 text-gray-500">{ing.minimo}</td>
                    <td className="px-5 py-3.5"><Badge label={estadoLabel(ing)} color={estadoBadge(ing)} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button title="Agregar stock" onClick={() => { formStock.reset(); setModalStock(ing) }}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors">
                          <PlusCircle size={16} />
                        </button>
                        <button title="Editar" onClick={() => abrirEditar(ing)}
                          className="p-1.5 rounded-lg hover:bg-orange-50 transition-colors" style={{ color: '#af4c0f' }}>
                          <Pencil size={16} />
                        </button>
                        <button title="Eliminar" onClick={() => setConfirmarEliminar(ing)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {ingredientes.length === 0 && (
              <p className="text-center py-10 text-gray-400 text-sm">Sin ingredientes registrados</p>
            )}
          </div>
        )}
      </div>

      {/* Modal Crear */}
      <Modal isOpen={modalCrear} onClose={() => setModalCrear(false)} title="Nuevo ingrediente">
        <form onSubmit={formCrear.handleSubmit((d) => mutCrear.mutate(d))} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="ID" error={formCrear.formState.errors.ing_id?.message}>
              <input {...formCrear.register('ing_id')} placeholder="ej. cafe-001" className={INPUT} />
            </Field>
            <Field label="Nombre" error={formCrear.formState.errors.nombre?.message}>
              <input {...formCrear.register('nombre')} placeholder="ej. Cafe molido" className={INPUT} />
            </Field>
            <Field label="Stock inicial" error={formCrear.formState.errors.stock?.message}>
              <input {...formCrear.register('stock')} type="number" min="0" className={INPUT} />
            </Field>
            <Field label="Unidad" error={formCrear.formState.errors.u_medida?.message}>
              <select {...formCrear.register('u_medida')} className={INPUT}>
                <option value="">Seleccionar</option>
                <option value="ml">ml</option>
                <option value="g">g</option>
                <option value="u">u (unidad)</option>
              </select>
            </Field>
            <Field label="Stock minimo" error={formCrear.formState.errors.minimo?.message}>
              <input {...formCrear.register('minimo')} type="number" min="0" className={INPUT} />
            </Field>
          </div>
          {mutCrear.isError && <p className="text-xs text-red-500">Error al crear ingrediente</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalCrear(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
            <button type="submit" disabled={mutCrear.isPending} className={BTN_PRIMARY} style={{ background: '#af4c0f' }}>
              {mutCrear.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar */}
      <Modal isOpen={!!modalEditar} onClose={() => setModalEditar(null)} title="Editar ingrediente">
        <form onSubmit={formEditar.handleSubmit((d) => {
          if (!modalEditar) return
          const { ing_id, ...rest } = d
          mutEditar.mutate({ ing_id: modalEditar.ing_id, datos: rest })
        })} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="ID (no editable)" error={undefined}>
              <input value={modalEditar?.ing_id ?? ''} disabled className={INPUT + ' bg-gray-50 text-gray-400'} />
            </Field>
            <Field label="Nombre" error={formEditar.formState.errors.nombre?.message}>
              <input {...formEditar.register('nombre')} className={INPUT} />
            </Field>
            <Field label="Stock" error={formEditar.formState.errors.stock?.message}>
              <input {...formEditar.register('stock')} type="number" min="0" className={INPUT} />
            </Field>
            <Field label="Unidad" error={formEditar.formState.errors.u_medida?.message}>
              <select {...formEditar.register('u_medida')} className={INPUT}>
                <option value="ml">ml</option>
                <option value="g">g</option>
                <option value="u">u (unidad)</option>
              </select>
            </Field>
            <Field label="Stock minimo" error={formEditar.formState.errors.minimo?.message}>
              <input {...formEditar.register('minimo')} type="number" min="0" className={INPUT} />
            </Field>
          </div>
          {mutEditar.isError && <p className="text-xs text-red-500">Error al actualizar</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalEditar(null)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
            <button type="submit" disabled={mutEditar.isPending} className={BTN_PRIMARY} style={{ background: '#af4c0f' }}>
              {mutEditar.isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal +Stock */}
      <Modal isOpen={!!modalStock} onClose={() => setModalStock(null)} title={`Agregar stock ? ${modalStock?.nombre}`} maxWidth={360}>
        <form onSubmit={formStock.handleSubmit((d) => {
          if (!modalStock) return
          mutStock.mutate({ ing_id: modalStock.ing_id, cantidad: d.cantidad })
        })} className="flex flex-col gap-4">
          <Field label="Cantidad a agregar" error={formStock.formState.errors.cantidad?.message}>
            <input {...formStock.register('cantidad')} type="number" min="1" className={INPUT} autoFocus />
          </Field>
          {mutStock.isError && <p className="text-xs text-red-500">Error al actualizar stock</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalStock(null)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
            <button type="submit" disabled={mutStock.isPending} className={BTN_PRIMARY} style={{ background: '#16a34a' }}>
              {mutStock.isPending ? 'Agregando...' : 'Agregar stock'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Eliminar */}
      <Modal isOpen={!!confirmarEliminar} onClose={() => setConfirmarEliminar(null)} title="Confirmar eliminacion" maxWidth={400}>
        <p className="text-sm text-gray-600 mb-6">
          ?Seguro que deseas eliminar <strong>{confirmarEliminar?.nombre}</strong>? Esta accion no se puede deshacer.
        </p>
        {mutEliminar.isError && <p className="text-xs text-red-500 mb-3">Error al eliminar</p>}
        <div className="flex justify-end gap-3">
          <button onClick={() => setConfirmarEliminar(null)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
          <button
            onClick={() => confirmarEliminar && mutEliminar.mutate(confirmarEliminar.ing_id)}
            disabled={mutEliminar.isPending}
            className={BTN_DANGER}
          >
            {mutEliminar.isPending ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
