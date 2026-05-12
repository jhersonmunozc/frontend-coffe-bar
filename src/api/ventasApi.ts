import axiosInstance from './axiosInstance'

export interface ReporteDiario {
  fecha: string
  totalDia: number
  cantidadVentas: number
  promedioPorVenta: number
}

export async function getReporteDiario(): Promise<ReporteDiario> {
  const { data } = await axiosInstance.get<ReporteDiario>('/ventas/reporte/diario')
  return data
}
