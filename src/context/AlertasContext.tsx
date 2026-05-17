import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getHistorialAlertas, marcarAlertaVista, eliminarAlertaApi } from '../api/alertasApi'
import type { Alerta } from '../types/cafesino.types'

/* ─── Tipo local (backward compat con useAlertas / AlertasTable) ─── */
export interface AlertaLocal {
  id:            string
  fecha:         string
  ingredienteId: string
  ingrediente:   string
  nivel:         'bajo' | 'agotado' | 'critico'
  mensaje:       string
  visto:         'pendiente' | 'resuelto'
}

/* Convierte el formato del backend → formato local */
function toLocal(a: Alerta): AlertaLocal {
  const nivelMap: Record<string, AlertaLocal['nivel']> = {
    bajo: 'bajo', agotado: 'agotado', critico: 'critico',
    Bajo: 'bajo', Agotado: 'agotado', Critico: 'critico',
  }
  return {
    id:            a.alert_id,
    fecha:         typeof a.fecha === 'string' ? a.fecha : new Date(a.fecha).toISOString(),
    ingredienteId: a.ing_id,
    ingrediente:   a.ing_id,
    nivel:         nivelMap[a.nivel] ?? 'bajo',
    mensaje:       a.msj,
    visto:         a.visto ? 'resuelto' : 'pendiente',
  }
}

/* ─── Contexto ──────────────────────────────────────────────────── */
interface AlertasCtxValue {
  alertas:              AlertaLocal[]
  pendientes:           number
  isLoading:            boolean
  marcarResuelto:       (id: string) => void
  marcarTodasResueltas: () => void
  eliminarAlerta:       (id: string) => void
}

const AlertasContext = createContext<AlertasCtxValue | null>(null)

export function AlertasProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient()
  const invalidar = () => qc.invalidateQueries({ queryKey: ['alertas'] })

  /* Fetch real desde MongoDB — refresca cada 30s y al enfocar ventana */
  const { data: raw = [], isLoading } = useQuery<Alerta[]>({
    queryKey: ['alertas'],
    queryFn:  getHistorialAlertas,
    staleTime: 0,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })

  const alertas   = useMemo(() => raw.map(toLocal), [raw])
  const pendientes = useMemo(() => alertas.filter(a => a.visto === 'pendiente').length, [alertas])

  /* Mutación: marcar una alerta como vista */
  const mutMarcar = useMutation({
    mutationFn: (id: string) => marcarAlertaVista(id),
    onSuccess: invalidar,
  })

  /* Mutación: marcar TODAS las pendientes como vistas */
  const mutMarcarTodas = useMutation({
    mutationFn: () => {
      const pendientesRaw = raw.filter(a => !a.visto)
      return Promise.all(pendientesRaw.map(a => marcarAlertaVista(a.alert_id)))
    },
    onSuccess: invalidar,
  })

  /* Mutación: eliminar una alerta */
  const mutEliminar = useMutation({
    mutationFn: (id: string) => eliminarAlertaApi(id),
    onSuccess: invalidar,
  })

  const marcarResuelto       = (id: string) => mutMarcar.mutate(id)
  const marcarTodasResueltas = ()            => mutMarcarTodas.mutate()
  const eliminarAlerta       = (id: string) => mutEliminar.mutate(id)

  return (
    <AlertasContext.Provider value={{
      alertas, pendientes, isLoading,
      marcarResuelto, marcarTodasResueltas, eliminarAlerta,
    }}>
      {children}
    </AlertasContext.Provider>
  )
}

export function useAlertasContext(): AlertasCtxValue {
  const ctx = useContext(AlertasContext)
  if (!ctx) throw new Error('useAlertasContext debe usarse dentro de AlertasProvider')
  return ctx
}
