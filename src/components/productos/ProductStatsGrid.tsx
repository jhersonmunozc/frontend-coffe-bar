import { ShoppingBag, CheckCircle, XCircle, DollarSign } from 'lucide-react'

function StatCard({ label, value, icon, accent, accentBg }: {
  label: string; value: string | number; icon: React.ReactNode; accent: string; accentBg: string
}) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '18px 20px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -10, right: -10, width: 60, height: 60, borderRadius: '0 14px 0 60px', background: accent + '12' }} />
      <div style={{ width: 34, height: 34, borderRadius: 9, background: accentBg, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        {icon}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 4, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 600, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
    </div>
  )
}

interface Props { total: number; disponibles: number; noDisponibles: number; precioPromedio: number }

export function ProductStatsGrid({ total, disponibles, noDisponibles, precioPromedio }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
      <StatCard label="Total productos"  value={total}       icon={<ShoppingBag size={16} />}  accent="var(--cafe)"  accentBg="var(--cafe-light)" />
      <StatCard label="Disponibles"      value={disponibles} icon={<CheckCircle size={16} />}  accent="var(--green)" accentBg="var(--green-bg)" />
      <StatCard label="No disponibles"   value={noDisponibles} icon={<XCircle size={16} />}    accent="var(--red)"   accentBg="var(--red-bg)" />
      <StatCard label="Precio promedio"  value={`$${precioPromedio.toLocaleString('es-CO')}`} icon={<DollarSign size={16} />} accent="var(--amber)" accentBg="var(--amber-bg)" />
    </div>
  )
}
