import { AlertTriangle } from 'lucide-react'

interface AlertBannerProps { crit: number; low: number }

export function AlertBanner({ crit, low }: AlertBannerProps) {
  if (crit === 0 && low === 0) return null

  const msg = crit > 0
    ? `${crit} ingrediente${crit > 1 ? 's' : ''} con stock critico requieren atenci?n inmediata.`
    : `${low} ingrediente${low > 1 ? 's' : ''} est?n por debajo del nivel minimo.`

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--amber-bg)', border: '1px solid rgba(192,123,26,0.25)',
      borderRadius: 10, padding: '11px 16px', marginBottom: 20,
    }}>
      <AlertTriangle size={18} style={{ color: 'var(--amber)', flexShrink: 0 }} />
      <span style={{ fontSize: 13.5, color: 'var(--text)', fontWeight: 500 }}>{msg}</span>
    </div>
  )
}
