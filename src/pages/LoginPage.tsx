import logo from '../assets/cafesino-logo.png'
import { LoginLeft }   from '../components/login/LoginLeft'
import { LoginHeader } from '../components/login/LoginHeader'
import { LoginForm }   from '../components/login/LoginForm'

export default function LoginPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* Panel izquierdo decorativo */}
      <LoginLeft />

      {/* Logo móvil (visible solo < 768px) */}
      <div
        className="login-mobile-logo"
        style={{
          display: 'none',
          flexDirection: 'column', alignItems: 'center', gap: 10,
          marginBottom: 28, position: 'absolute', top: 32, left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <div style={{ width: 40, height: 40, borderRadius: 11, overflow: 'hidden', background: 'var(--cafe)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={logo} alt="Cafesino" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none' }} />
        </div>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: 'var(--text)', fontWeight: 600 }}>
          Cafesino
        </span>
      </div>

      {/* Columna derecha – formulario */}
      <div style={{
        width: 480, flexShrink: 0, background: 'var(--bg)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 44px', position: 'relative',
      }}>

        {/* Badge seguridad */}
        <div style={{
          position: 'absolute', top: 28, right: 28,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Sistema seguro</span>
        </div>

        {/* Formulario */}
        <div style={{ width: '100%', maxWidth: 360 }}>
          <LoginHeader />
          <LoginForm />
        </div>

        {/* Pie de página */}
        <p style={{
          position: 'absolute', bottom: 24,
          fontSize: 11.5, color: 'var(--muted)',
          animation: 'fadeInUp 0.4s ease 0.50s both',
        }}>
          🔒 Solo personal autorizado · Cafesino
        </p>
      </div>
    </div>
  )
}
