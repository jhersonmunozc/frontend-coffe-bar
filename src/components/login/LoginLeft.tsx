import bg   from '../../assets/cafesino-bg.jpg'
import logo from '../../assets/cafesino-logo.png'

export function LoginLeft() {
  return (
    <div
      className="login-left"
      style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        backgroundImage: `url(${bg})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        backgroundColor: '#0d0500',
      }}
    >
      {/* Overlay: transparente arriba para ver la foto, oscuro abajo para legibilidad del texto */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(13,5,0,0.30) 0%, rgba(13,5,0,0.45) 45%, rgba(13,5,0,0.82) 75%, rgba(13,5,0,0.92) 100%)' }} />

      {/* Tinte cálido café sutil */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 50% at 30% 60%, rgba(200,90,18,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Contenido centrado verticalmente */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end', alignItems: 'center',
        padding: '0 48px 56px',
        textAlign: 'center',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, overflow: 'hidden',
            background: 'var(--cafe)', boxShadow: '0 8px 24px rgba(200,90,18,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <img src={logo} alt="Cafesino" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none' }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: '#fff', fontWeight: 600, lineHeight: 1.1 }}>
              Cafesino
            </div>
            <div style={{ fontSize: 11, letterSpacing: '1.2px', color: 'rgba(255,255,255,0.50)', marginTop: 2 }}>
              SISTEMA DE INVENTARIO
            </div>
          </div>
        </div>

        {/* Tagline */}
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, color: '#fff', lineHeight: 1.3, marginBottom: 14, fontWeight: 600 }}>
          El sabor del café,<br />
          la precisión del{' '}
          <em style={{ color: 'var(--cafe)', fontStyle: 'italic' }}>control.</em>
        </h2>

        <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, maxWidth: 320, margin: '0 auto 28px' }}>
          Gestiona tu inventario, productos e ingredientes desde un panel diseñado para tu cafetería.
        </p>

        {/* Dots */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ height: 7, width: 22, borderRadius: 4, background: 'var(--cafe)' }} />
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.25)' }} />
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.25)' }} />
        </div>
      </div>
    </div>
  )
}
