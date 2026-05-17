import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Users, UserCheck, ShieldCheck, UserX, Pencil, Trash2, Eye, EyeOff, X, Loader2 } from 'lucide-react'
import { Topbar } from '../../components/layout/Topbar'
import { useUsuarios } from '../../hooks/useUsuarios'
import type { Usuario } from '../../types/cafesino.types'

/* ─── Validación ─────────────────────────────────────────── */
const schemaCrear = z.object({
  usuario_id: z.string().min(2, 'Mínimo 2 caracteres'),
  nombre:     z.string().min(3, 'Mínimo 3 caracteres'),
  email:      z.string().email('Email inválido'),
  password:   z.string().min(6, 'Mínimo 6 caracteres'),
  rol:        z.enum(['Barista', 'Administrador']),
})

const schemaEditar = z.object({
  nombre:   z.string().min(3, 'Mínimo 3 caracteres'),
  email:    z.string().email('Email inválido'),
  rol:      z.enum(['Barista', 'Administrador']),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')),
})

type FormCrear  = z.infer<typeof schemaCrear>
type FormEditar = z.infer<typeof schemaEditar>

/* ─── Estilos reutilizables ──────────────────────────────── */
const CARD: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 14, padding: '20px 24px',
  display: 'flex', flexDirection: 'column', gap: 6,
}

const INPUT: React.CSSProperties = {
  width: '100%', border: '1.5px solid var(--border)', borderRadius: 10,
  padding: '10px 13px', fontSize: 14, background: '#fff',
  color: 'var(--text)', outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const LABEL: React.CSSProperties = {
  fontSize: 12.5, fontWeight: 600, color: 'var(--text)', marginBottom: 5, display: 'block',
}

const ERR: React.CSSProperties = { fontSize: 12, color: 'var(--red)', marginTop: 4 }

/* ─── Subcomponentes ────────────────────────────────────── */
function KpiCard({
  label, value, icon, accentColor, bgColor,
}: { label: string; value: number; icon: React.ReactNode; accentColor: string; bgColor: string }) {
  return (
    <div style={{ ...CARD, borderTop: `3px solid ${accentColor}`, animation: 'fadeInUp 0.35s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>{value}</div>
    </div>
  )
}

function RolBadge({ rol }: { rol: string }) {
  const isAdmin = rol === 'Administrador'
  return (
    <span style={{
      fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
      background: isAdmin ? 'var(--amber-bg)' : 'rgba(39,174,96,0.10)',
      color: isAdmin ? 'var(--amber)' : 'var(--green)',
    }}>
      {rol}
    </span>
  )
}

function ActivoBadge({ activo }: { activo: boolean }) {
  return (
    <span style={{
      fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
      background: activo ? 'rgba(39,174,96,0.10)' : 'var(--red-bg)',
      color: activo ? 'var(--green)' : 'var(--red)',
    }}>
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  )
}

/* ─── Modal crear usuario ───────────────────────────────── */
function ModalCrear({ onClose }: { onClose: () => void }) {
  const { mutCrear } = useUsuarios()
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormCrear>({
    resolver: zodResolver(schemaCrear),
    defaultValues: { rol: 'Barista' },
  })

  const onSubmit = (data: FormCrear) => {
    mutCrear.mutate(data, { onSuccess: onClose })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface)', borderRadius: 16, padding: 32, width: 460, maxWidth: '90vw',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)', animation: 'fadeInUp 0.2s ease both',
      }} onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Nuevo usuario</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '4px 0 0' }}>Crea una cuenta de acceso al panel</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* ID y Nombre */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={LABEL}>ID usuario</label>
              <input {...register('usuario_id')} placeholder="U003" style={INPUT} />
              {errors.usuario_id && <p style={ERR}>{errors.usuario_id.message}</p>}
            </div>
            <div>
              <label style={LABEL}>Nombre completo</label>
              <input {...register('nombre')} placeholder="Juan García" style={INPUT} />
              {errors.nombre && <p style={ERR}>{errors.nombre.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={LABEL}>Correo electrónico</label>
            <input {...register('email')} type="email" placeholder="juan@cafesino.com" style={INPUT} />
            {errors.email && <p style={ERR}>{errors.email.message}</p>}
          </div>

          {/* Contraseña */}
          <div>
            <label style={LABEL}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                {...register('password')}
                type={showPass ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                style={{ ...INPUT, paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p style={ERR}>{errors.password.message}</p>}
          </div>

          {/* Rol */}
          <div>
            <label style={LABEL}>Rol</label>
            <select {...register('rol')} style={{ ...INPUT, cursor: 'pointer' }}>
              <option value="Barista">Barista</option>
              <option value="Administrador">Administrador</option>
            </select>
            {errors.rol && <p style={ERR}>{errors.rol.message}</p>}
          </div>

          {mutCrear.isError && (
            <p style={{ ...ERR, background: 'var(--red-bg)', padding: '8px 12px', borderRadius: 8 }}>
              {(mutCrear.error as any)?.response?.data?.message ?? 'Error al crear usuario'}
            </p>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{
              padding: '10px 20px', borderRadius: 10, border: '1.5px solid var(--border)',
              background: 'none', color: 'var(--text)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}>
              Cancelar
            </button>
            <button type="submit" disabled={mutCrear.isPending} style={{
              padding: '10px 24px', borderRadius: 10, border: 'none',
              background: 'var(--cafe)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, opacity: mutCrear.isPending ? 0.7 : 1,
            }}>
              {mutCrear.isPending && <Loader2 size={15} style={{ animation: 'spin 0.7s linear infinite' }} />}
              Crear usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Modal editar usuario ──────────────────────────────── */
function ModalEditar({ usuario, onClose }: { usuario: Usuario; onClose: () => void }) {
  const { mutEditar } = useUsuarios()
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormEditar>({
    resolver: zodResolver(schemaEditar),
    defaultValues: { nombre: usuario.nombre, email: usuario.email, rol: usuario.rol, password: '' },
  })

  const onSubmit = (data: FormEditar) => {
    const payload: any = { nombre: data.nombre, email: data.email, rol: data.rol }
    if (data.password) payload.password = data.password
    mutEditar.mutate({ usuario_id: usuario.usuario_id, datos: payload }, { onSuccess: onClose })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface)', borderRadius: 16, padding: 32, width: 460, maxWidth: '90vw',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)', animation: 'fadeInUp 0.2s ease both',
      }} onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Editar usuario</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '4px 0 0' }}>{usuario.usuario_id} · {usuario.email}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={LABEL}>Nombre completo</label>
            <input {...register('nombre')} style={INPUT} />
            {errors.nombre && <p style={ERR}>{errors.nombre.message}</p>}
          </div>

          <div>
            <label style={LABEL}>Correo electrónico</label>
            <input {...register('email')} type="email" style={INPUT} />
            {errors.email && <p style={ERR}>{errors.email.message}</p>}
          </div>

          <div>
            <label style={LABEL}>Nueva contraseña <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(dejar vacío para no cambiar)</span></label>
            <div style={{ position: 'relative' }}>
              <input
                {...register('password')}
                type={showPass ? 'text' : 'password'}
                placeholder="Nueva contraseña..."
                style={{ ...INPUT, paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p style={ERR}>{errors.password.message}</p>}
          </div>

          <div>
            <label style={LABEL}>Rol</label>
            <select {...register('rol')} style={{ ...INPUT, cursor: 'pointer' }}>
              <option value="Barista">Barista</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>

          {mutEditar.isError && (
            <p style={{ ...ERR, background: 'var(--red-bg)', padding: '8px 12px', borderRadius: 8 }}>
              {(mutEditar.error as any)?.response?.data?.message ?? 'Error al actualizar'}
            </p>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{
              padding: '10px 20px', borderRadius: 10, border: '1.5px solid var(--border)',
              background: 'none', color: 'var(--text)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}>
              Cancelar
            </button>
            <button type="submit" disabled={mutEditar.isPending} style={{
              padding: '10px 24px', borderRadius: 10, border: 'none',
              background: 'var(--cafe)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, opacity: mutEditar.isPending ? 0.7 : 1,
            }}>
              {mutEditar.isPending && <Loader2 size={15} style={{ animation: 'spin 0.7s linear infinite' }} />}
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Página principal ──────────────────────────────────── */
export default function UsuariosPage() {
  const { usuarios, isLoading, isError, mutEliminar, mutToggle } = useUsuarios()
  const [modalCrear, setModalCrear] = useState(false)
  const [editando, setEditando]     = useState<Usuario | null>(null)
  const [busqueda, setBusqueda]     = useState('')

  const total    = usuarios.length
  const baristas = usuarios.filter(u => u.rol === 'Barista' && u.activo).length
  const admins   = usuarios.filter(u => u.rol === 'Administrador').length
  const inactivos = usuarios.filter(u => !u.activo).length

  const filtrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.usuario_id.toLowerCase().includes(busqueda.toLowerCase())
  )

  const handleEliminar = (u: Usuario) => {
    if (window.confirm(`¿Eliminar a ${u.nombre}? Esta acción no se puede deshacer.`)) {
      mutEliminar.mutate(u.usuario_id)
    }
  }

  return (
    <div style={{ padding: '28px 32px', background: 'var(--bg)', minHeight: '100vh' }}>
      <Topbar
        title="Usuarios"
        subtitle="Gestión de cuentas de acceso al panel"
        labelBoton="Nuevo usuario"
        onNuevo={() => setModalCrear(true)}
        searchPlaceholder="Buscar por nombre, email o ID..."
        searchValue={busqueda}
        onSearchChange={setBusqueda}
      />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <KpiCard label="Total usuarios"    value={total}    accentColor="var(--cafe)"  bgColor="rgba(200,90,18,0.10)"  icon={<Users size={17} color="var(--cafe)" />} />
        <KpiCard label="Baristas activos"  value={baristas} accentColor="var(--green)" bgColor="rgba(39,174,96,0.10)"  icon={<UserCheck size={17} color="var(--green)" />} />
        <KpiCard label="Administradores"   value={admins}   accentColor="var(--amber)" bgColor="var(--amber-bg)"       icon={<ShieldCheck size={17} color="var(--amber)" />} />
        <KpiCard label="Inactivos"         value={inactivos} accentColor="var(--red)"  bgColor="var(--red-bg)"         icon={<UserX size={17} color="var(--red)" />} />
      </div>

      {/* Tabla */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
            Lista de usuarios
            <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 400, marginLeft: 8 }}>
              {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
            </span>
          </span>
        </div>

        {isLoading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
            <Loader2 size={28} style={{ animation: 'spin 0.8s linear infinite', marginBottom: 10 }} />
            <p style={{ margin: 0 }}>Cargando usuarios…</p>
          </div>
        ) : isError ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--red)' }}>
            Error al cargar usuarios. Verifica la conexión con el servidor.
          </div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
            <Users size={36} style={{ marginBottom: 10, opacity: 0.3 }} />
            <p style={{ margin: 0 }}>No se encontraron usuarios</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg)' }}>
                  {['Usuario', 'Rol', 'Email', 'Estado', 'Última conexión', 'Acciones'].map(h => (
                    <th key={h} style={{
                      padding: '11px 20px', textAlign: 'left',
                      fontSize: 11.5, fontWeight: 600, color: 'var(--muted)',
                      letterSpacing: '0.5px', textTransform: 'uppercase',
                      borderBottom: '1px solid var(--border)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map((u, i) => (
                  <tr
                    key={u.usuario_id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      animation: `fadeInUp 0.25s ease ${i * 0.04}s both`,
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Avatar + Nombre */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', background: u.rol === 'Administrador' ? 'var(--amber-bg)' : 'rgba(39,174,96,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 700, color: u.rol === 'Administrador' ? 'var(--amber)' : 'var(--green)',
                          flexShrink: 0,
                        }}>
                          {u.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{u.nombre}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{u.usuario_id}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 20px' }}><RolBadge rol={u.rol} /></td>
                    <td style={{ padding: '14px 20px', fontSize: 13.5, color: 'var(--muted)' }}>{u.email}</td>

                    {/* Toggle activo */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={() => mutToggle.mutate({ usuario_id: u.usuario_id, activo: !u.activo })}
                          title={u.activo ? 'Desactivar' : 'Activar'}
                          style={{
                            width: 38, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
                            background: u.activo ? 'var(--green)' : 'var(--border)',
                            position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                          }}
                        >
                          <span style={{
                            position: 'absolute', top: 3, left: u.activo ? 19 : 3,
                            width: 16, height: 16, borderRadius: '50%', background: '#fff',
                            transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          }} />
                        </button>
                        <ActivoBadge activo={u.activo} />
                      </div>
                    </td>

                    <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--muted)' }}>
                      {u.ultimaConexion
                        ? new Date(u.ultimaConexion).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
                        : <span style={{ color: 'var(--border)' }}>Sin registrar</span>}
                    </td>

                    {/* Acciones */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => setEditando(u)}
                          title="Editar"
                          style={{
                            padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--border)',
                            background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                            fontSize: 12.5, color: 'var(--text)', fontWeight: 500,
                          }}
                        >
                          <Pencil size={13} /> Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(u)}
                          title="Eliminar"
                          style={{
                            padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--red-bg)',
                            background: 'var(--red-bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                            fontSize: 12.5, color: 'var(--red)', fontWeight: 500,
                          }}
                        >
                          <Trash2 size={13} /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalCrear && <ModalCrear onClose={() => setModalCrear(false)} />}
      {editando   && <ModalEditar usuario={editando} onClose={() => setEditando(null)} />}
    </div>
  )
}
