interface ToggleSwitchProps {
  checked: boolean
  onChange: () => void
  labelOn?: string
  labelOff?: string
}

export function ToggleSwitch({ checked, onChange, labelOn = 'Disponible', labelOff = 'No disponible' }: ToggleSwitchProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button
        onClick={onChange}
        role="switch"
        aria-checked={checked}
        style={{
          width: 42, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer',
          background: checked ? 'var(--green)' : '#D1C5BC',
          position: 'relative', flexShrink: 0, transition: 'background-color 0.2s',
          padding: 0,
        }}
      >
        <span style={{
          position: 'absolute', top: 3,
          left: checked ? 21 : 3,
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          display: 'block',
        }} />
      </button>
      <span style={{ fontSize: 12, color: checked ? 'var(--green)' : 'var(--muted)', fontWeight: 500 }}>
        {checked ? labelOn : labelOff}
      </span>
    </div>
  )
}
