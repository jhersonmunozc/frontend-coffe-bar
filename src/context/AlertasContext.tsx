import { createContext, useContext, useState, type ReactNode } from 'react'

export interface AlertaLocal {
  id:            string
  fecha:         string
  ingredienteId: string
  ingrediente:   string
  nivel:         'bajo' | 'agotado' | 'critico'
  mensaje:       string
  visto:         'pendiente' | 'resuelto'
}

const SEED: AlertaLocal[] = [
  { id:'A001', fecha:'2026-04-17T22:52:00', ingredienteId:'I005', ingrediente:'Cafe en grano',   nivel:'bajo',    mensaje:'Stock critico: Cafe en grano (5838g)',            visto:'pendiente' },
  { id:'A002', fecha:'2026-04-17T21:49:00', ingredienteId:'I005', ingrediente:'Cafe en grano',   nivel:'bajo',    mensaje:'Stock critico: Cafe en grano (5847g)',            visto:'pendiente' },
  { id:'A003', fecha:'2026-04-17T21:49:00', ingredienteId:'I005', ingrediente:'Cafe en grano',   nivel:'bajo',    mensaje:'Stock critico: Cafe en grano (5856g)',            visto:'pendiente' },
  { id:'A004', fecha:'2026-04-17T21:14:00', ingredienteId:'I005', ingrediente:'Cafe en grano',   nivel:'bajo',    mensaje:'Stock critico: Cafe en grano (5883g)',            visto:'pendiente' },
  { id:'A005', fecha:'2026-04-13T20:17:00', ingredienteId:'I005', ingrediente:'Cafe en grano',   nivel:'bajo',    mensaje:'Stock critico: Cafe en grano (4892g)',            visto:'pendiente' },
  { id:'A006', fecha:'2026-03-08T06:30:00', ingredienteId:'I06',  ingrediente:'Leche',           nivel:'agotado', mensaje:'Leche insuficiente para preparar Capuccinos',    visto:'pendiente' },
  { id:'A007', fecha:'2026-03-08T04:00:00', ingredienteId:'I05',  ingrediente:'Cafe Premium',    nivel:'bajo',    mensaje:'Insumo Critico: Cafe por debajo de 500g',        visto:'pendiente' },
  { id:'A008', fecha:'2026-03-06T23:45:00', ingredienteId:'I02',  ingrediente:'Almidon',         nivel:'critico', mensaje:'Almidon en nivel minimo',                        visto:'resuelto'  },
]

interface AlertasCtxValue {
  alertas:               AlertaLocal[]
  pendientes:            number
  marcarResuelto:        (id: string) => void
  marcarTodasResueltas:  () => void
  eliminarAlerta:        (id: string) => void
}

const AlertasContext = createContext<AlertasCtxValue | null>(null)

export function AlertasProvider({ children }: { children: ReactNode }) {
  const [alertas, setAlertas] = useState<AlertaLocal[]>(SEED)

  const pendientes = alertas.filter((a) => a.visto === 'pendiente').length

  const marcarResuelto = (id: string) =>
    setAlertas((prev) => prev.map((a) => a.id === id ? { ...a, visto: 'resuelto' } : a))

  const marcarTodasResueltas = () =>
    setAlertas((prev) => prev.map((a) => a.visto === 'pendiente' ? { ...a, visto: 'resuelto' } : a))

  const eliminarAlerta = (id: string) =>
    setAlertas((prev) => prev.filter((a) => a.id !== id))

  return (
    <AlertasContext.Provider value={{ alertas, pendientes, marcarResuelto, marcarTodasResueltas, eliminarAlerta }}>
      {children}
    </AlertasContext.Provider>
  )
}

export function useAlertasContext(): AlertasCtxValue {
  const ctx = useContext(AlertasContext)
  if (!ctx) throw new Error('useAlertasContext debe usarse dentro de AlertasProvider')
  return ctx
}
