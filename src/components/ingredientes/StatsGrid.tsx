import { Package, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
  accent: string
  accentBg: string
}

function StatCard({ label, value, icon, accent, accentBg }: StatCardProps) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '18px 20px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -10, right: -10,
        width: 60, height: 60, borderRadius: '0 14px 0 60px',
        background: accent + '12',
      }} />
      <div style={{
        width: 34, height: 34, borderRadius: 9,
        background: accentBg, color: accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 12,
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 4, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 600, color: 'var(--text)', lineHeight: 1 }}>
        {Math.round(value).toLocaleString('es-CO')}
      </div>
    </div>
  )
}

interface StatsGridProps {
  total: number
  ok: number
  low: number
  crit: number
}

export function StatsGrid({ total, ok, low, crit }: StatsGridProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
      <StatCard label="Total ingredientes" value={total} icon={<Package size={16} />}       accent="var(--cafe)"  accentBg="var(--cafe-light)" />
      <StatCard label="En buen estado"     value={ok}    icon={<CheckCircle size={16} />}   accent="var(--green)" accentBg="var(--green-bg)" />
      <StatCard label="Stock bajo"         value={low}   icon={<AlertTriangle size={16} />} accent="var(--amber)" accentBg="var(--amber-bg)" />
      <StatCard label="Stock critico"      value={crit}  icon={<AlertCircle size={16} />}   accent="var(--red)"   accentBg="var(--red-bg)" />
    </div>
  )
}
