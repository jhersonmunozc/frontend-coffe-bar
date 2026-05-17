interface StatsProps {
  total: number
  bajo: number
  agotado: number
  critico: number
}

interface StatCardProps {
  label: string
  value: number
  pillText: string
  accentColor: string
  bgColor: string
  iconColor: string
  icon: React.ReactNode
}

function StatCard({ label, value, pillText, accentColor, bgColor, iconColor, icon }: StatCardProps) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
      padding: '18px 20px', borderTop: `3px solid ${accentColor}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor }}>
          {icon}
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, background: bgColor, color: iconColor, borderRadius: 99, padding: '2px 9px' }}>
          {pillText}
        </span>
      </div>
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: 'var(--text)', margin: '0 0 2px', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.9px', margin: 0 }}>{label}</p>
    </div>
  )
}

export function AlertasStats({ total, bajo, agotado, critico }: StatsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
      <StatCard
        label="Total alertas"
        value={total}
        pillText={`${total} total`}
        accentColor="var(--text)"
        bgColor="rgba(44,26,14,0.08)"
        iconColor="var(--text)"
        icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
      />
      <StatCard
        label="Stock bajo"
        value={bajo}
        pillText={`${bajo} alertas`}
        accentColor="var(--amber)"
        bgColor="var(--amber-bg)"
        iconColor="var(--amber)"
        icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>}
      />
      <StatCard
        label="Agotados"
        value={agotado}
        pillText={`${agotado} alertas`}
        accentColor="#6A1B9A"
        bgColor="#F3E5F5"
        iconColor="#6A1B9A"
        icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" x2="19.07" y1="4.93" y2="19.07"/></svg>}
      />
      <StatCard
        label="Criticos"
        value={critico}
        pillText={`${critico} urgente(s)`}
        accentColor="var(--red)"
        bgColor="var(--red-bg)"
        iconColor="var(--red)"
        icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>}
      />
    </div>
  )
}
