import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import {
  getProductos,
  crearProducto,
  editarProducto,
  eliminarProducto,
} from '../../api/productosApi'
import type { Producto } from '../../types/cafesino.types'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'

/* ?? Schemas ?? */
const schemaProducto = z.object({
  prod_id:   z.string().min(1, 'Requerido').regex(/^\S+$/, 'Sin espacios'),
  nombre:    z.string().min(2, 'Min 2 caracteres'),
  categoria: z.string().min(2, 'Min 2 caracteres'),
  precio:    z.coerce.number().min(1, 'Debe ser mayor a 0'),
})
type FormProducto = z.infer<typeof schemaProducto>

const schemaEditar = schemaProducto.omit({ prod_id: true })
type FormEditar = z.infer<typeof schemaEditar>

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

export default function ProductosPage() {
  const qc = useQueryClient()
  const { data: productos = [], isLoading, isError, error, refetch } = useQuery({ queryKey: ['productos-admin'], queryFn: getProductos })

  const [modalCrear,  setModalCrear]  = useState(false)
  const [modalEditar, setModalEditar] = useState<Producto | null>(null)
  const [confirmar,   setConfirmar]   = useState<Producto | null>(null)

  const invalidar = () => qc.invalidateQueries({ queryKey: ['productos-admin'] })

  const mutCrear = useMutation({
    mutationFn: crearProducto,
    onSuccess: () => { invalidar(); setModalCrear(false) },
  })
  const mutEditar = useMutation({
    mutationFn: ({ prod_id, datos }: { prod_id: string; datos: FormEditar }) => editarProducto(prod_id, datos),
    onSuccess: () => { invalidar(); setModalEditar(null) },
  })
  const mutEliminar = useMutation({
    mutationFn: (prod_id: string) => eliminarProducto(prod_id),
    onSuccess: () => { invalidar(); setConfirmar(null) },
  })

  const formCrear  = useForm<FormProducto>({ resolver: zodResolver(schemaProducto) })
  const formEditar = useForm<FormEditar>({ resolver: zodResolver(schemaEditar) })

  const abrirEditar = (p: Producto) => {
    formEditar.reset({ nombre: p.nombre, categoria: p.categoria, precio: p.precio })
    setModalEditar(p)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bold leading-none" style={{ fontSize: 28, color: '#1a1a2e', fontFamily: "'Playfair Display', serif" }}>
            Productos
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#6b7280' }}>Gestion del catalogo</p>
        </div>
        <button onClick={() => { formCrear.reset(); setModalCrear(true) }} className={BTN_PRIMARY} style={{ background: '#af4c0f' }}>
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Cargando productos...</div>
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
                  {['ID', 'Nombre', 'Categoria', 'Precio', 'Disponible', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3 font-semibold uppercase tracking-wider" style={{ fontSize: 11, color: '#9ca3af' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.prod_id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{p.prod_id}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">{p.nombre}</td>
                    <td className="px-5 py-3.5 text-gray-500">{p.categoria}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">${p.precio.toLocaleString('es-CO')}</td>
                    <td className="px-5 py-3.5">
                      <Badge label={p.disponible ? 'Disponible' : 'No disponible'} color={p.disponible ? 'green' : 'gray'} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button title="Editar" onClick={() => abrirEditar(p)}
                          className="p-1.5 rounded-lg hover:bg-orange-50 transition-colors" style={{ color: '#af4c0f' }}>
                          <Pencil size={16} />
                        </button>
                        <button title="Eliminar" onClick={() => setConfirmar(p)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {productos.length === 0 && (
              <p className="text-center py-10 text-gray-400 text-sm">Sin productos registrados</p>
            )}
          </div>
        )}
      </div>

      {/* Modal Crear */}
      <Modal isOpen={modalCrear} onClose={() => setModalCrear(false)} title="Nuevo producto">
        <form onSubmit={formCrear.handleSubmit((d) => mutCrear.mutate(d))} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="ID" error={formCrear.formState.errors.prod_id?.message}>
              <input {...formCrear.register('prod_id')} placeholder="ej. prod-001" className={INPUT} />
            </Field>
            <Field label="Nombre" error={formCrear.formState.errors.nombre?.message}>
              <input {...formCrear.register('nombre')} placeholder="ej. Cappuccino" className={INPUT} />
            </Field>
            <Field label="Categoria" error={formCrear.formState.errors.categoria?.message}>
              <input {...formCrear.register('categoria')} placeholder="ej. Bebida caliente" className={INPUT} />
            </Field>
            <Field label="Precio (COP)" error={formCrear.formState.errors.precio?.message}>
              <input {...formCrear.register('precio')} type="number" min="1" className={INPUT} />
            </Field>
          </div>
          {mutCrear.isError && <p className="text-xs text-red-500">Error al crear producto</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalCrear(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
            <button type="submit" disabled={mutCrear.isPending} className={BTN_PRIMARY} style={{ background: '#af4c0f' }}>
              {mutCrear.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar */}
      <Modal isOpen={!!modalEditar} onClose={() => setModalEditar(null)} title="Editar producto">
        <form onSubmit={formEditar.handleSubmit((d) => {
          if (!modalEditar) return
          mutEditar.mutate({ prod_id: modalEditar.prod_id, datos: d })
        })} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="ID (no editable)" error={undefined}>
              <input value={modalEditar?.prod_id ?? ''} disabled className={INPUT + ' bg-gray-50 text-gray-400'} />
            </Field>
            <Field label="Nombre" error={formEditar.formState.errors.nombre?.message}>
              <input {...formEditar.register('nombre')} className={INPUT} />
            </Field>
            <Field label="Categoria" error={formEditar.formState.errors.categoria?.message}>
              <input {...formEditar.register('categoria')} className={INPUT} />
            </Field>
            <Field label="Precio (COP)" error={formEditar.formState.errors.precio?.message}>
              <input {...formEditar.register('precio')} type="number" min="1" className={INPUT} />
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

      {/* Confirm Eliminar */}
      <Modal isOpen={!!confirmar} onClose={() => setConfirmar(null)} title="Confirmar eliminacion" maxWidth={400}>
        <p className="text-sm text-gray-600 mb-2">
          ?Seguro que deseas eliminar <strong>{confirmar?.nombre}</strong>?
        </p>
        <p className="text-xs text-yellow-700 bg-yellow-50 rounded-lg px-3 py-2 mb-5">
          No se puede eliminar si tiene una receta asociada.
        </p>
        {mutEliminar.isError && <p className="text-xs text-red-500 mb-3">Error al eliminar. Verifica que no tenga receta.</p>}
        <div className="flex justify-end gap-3">
          <button onClick={() => setConfirmar(null)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
          <button onClick={() => confirmar && mutEliminar.mutate(confirmar.prod_id)} disabled={mutEliminar.isPending} className={BTN_DANGER}>
            {mutEliminar.isPending ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
