import { useState, type CSSProperties } from 'react'
import logoImg from '../../assets/cafesino-logo.png'

const WRAP: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 11,
  background: '#f8f4ec',
  border: '1px solid rgba(255,255,255,0.14)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  overflow: 'hidden',
  padding: 2,
}

/** Marca Cafésino para sidebars oscuros (usa el mismo arte que login / splash). */
export function SidebarLogoMark() {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          background: 'var(--cafe)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: 20,
          color: '#fff',
        }}
        aria-hidden
      >
        ☕
      </div>
    )
  }

  return (
    <div style={WRAP}>
      <img
        src={logoImg}
        alt=""
        width={34}
        height={34}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        draggable={false}
        onError={() => setFailed(true)}
      />
    </div>
  )
}
