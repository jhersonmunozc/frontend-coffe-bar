interface BadgeProps {
  label: string
  color: 'green' | 'red' | 'yellow' | 'gray' | 'orange'
}

const COLORS = {
  green:  { bg: '#dcfce7', text: '#15803d' },
  red:    { bg: '#fee2e2', text: '#dc2626' },
  yellow: { bg: '#fef9c3', text: '#a16207' },
  gray:   { bg: '#f3f4f6', text: '#6b7280' },
  orange: { bg: '#ffedd5', text: '#c2410c' },
}

export function Badge({ label, color }: BadgeProps) {
  const { bg, text } = COLORS[color]
  return (
    <span
      className="inline-flex items-center rounded-full font-semibold"
      style={{ background: bg, color: text, fontSize: 11, padding: '3px 10px', letterSpacing: '0.04em' }}
    >
      {label}
    </span>
  )
}
