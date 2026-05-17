import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import { useLogin } from '../../hooks/useLogin'

const INPUT_BASE: React.CSSProperties = {
  width: '100%', border: '1.5px solid var(--border)', borderRadius: 10,
  padding: '12px 14px 12px 38px', fontSize: 14, background: '#fff',
  color: 'var(--text)', outline: 'none', fontFamily: 'inherit',
  transition: 'border-color 0.15s, box-shadow 0.15s',
}

export function LoginForm() {
  const {
    register, errors, showPassword, toggleShowPassword,
    isLoading, serverError, handleSubmit,
  } = useLogin()

  const focusStyle = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor  = 'var(--cafe)'
    e.target.style.boxShadow    = '0 0 0 3px rgba(200,90,18,0.10)'
  }
  const blurStyle = (hasErr: boolean) => (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor  = hasErr ? 'var(--red)' : 'var(--border)'
    e.target.style.boxShadow    = 'none'
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%' }}>

      {/* Banner de error */}
      {serverError && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 8,
          background: 'var(--red-bg)', border: '1px solid rgba(192,57,43,0.2)',
          borderRadius: 8, padding: '10px 14px',
          animation: 'fadeInUp 0.25s ease both',
        }}>
          <AlertCircle size={15} style={{ color: 'var(--red)', flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12.5, color: 'var(--red)', lineHeight: 1.4 }}>{serverError}</span>
        </div>
      )}

      {/* Campo email */}
      <div style={{ animation: 'fadeInUp 0.4s ease 0.20s both' }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 7 }}>
          Correo electrónico
        </label>
        <div style={{ position: 'relative' }}>
          <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#C5B8AE', pointerEvents: 'none' }} />
          <input
            type="email"
            autoComplete="email"
            placeholder="usuario@cafesino.com"
            {...register('email')}
            style={{ ...INPUT_BASE, borderColor: errors.email ? 'var(--red)' : 'var(--border)' }}
            onFocus={focusStyle}
            onBlur={blurStyle(!!errors.email)}
          />
        </div>
        {errors.email && (
          <p style={{ fontSize: 11.5, color: 'var(--red)', marginTop: 4 }}>{errors.email.message}</p>
        )}
      </div>

      {/* Campo contraseña */}
      <div style={{ animation: 'fadeInUp 0.4s ease 0.28s both' }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 7 }}>
          Contraseña
        </label>
        <div style={{ position: 'relative' }}>
          <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#C5B8AE', pointerEvents: 'none' }} />
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="????????"
            {...register('password')}
            style={{ ...INPUT_BASE, paddingRight: 40, borderColor: errors.password ? 'var(--red)' : 'var(--border)' }}
            onFocus={focusStyle}
            onBlur={blurStyle(!!errors.password)}
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#C5B8AE', padding: 2, display: 'flex' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--muted)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#C5B8AE')}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p style={{ fontSize: 11.5, color: 'var(--red)', marginTop: 4 }}>{errors.password.message}</p>
        )}
      </div>

      {/* Enlace olvidó contraseña */}
      <div style={{ textAlign: 'right', marginTop: -6, animation: 'fadeInUp 0.4s ease 0.34s both' }}>
        <span
          style={{ fontSize: 12.5, color: 'var(--cafe)', fontWeight: 500, cursor: 'pointer' }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
        >
          ¿Olvidaste tu contraseña?
        </span>
      </div>

      {/* Botón submit */}
      <button
        type="submit"
        className={isLoading ? 'login-btn-loading' : ''}
        style={{
          width: '100%', padding: 14, background: 'var(--cafe)', color: '#fff',
          border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
          letterSpacing: '0.3px', cursor: 'pointer', position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'background 0.15s, box-shadow 0.15s, transform 0.1s',
          animation: 'fadeInUp 0.4s ease 0.40s both',
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.background  = 'var(--cafe-dark)'
            e.currentTarget.style.boxShadow   = '0 8px 20px rgba(200,90,18,0.35)'
            e.currentTarget.style.transform   = 'translateY(-1px)'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background  = 'var(--cafe)'
          e.currentTarget.style.boxShadow   = 'none'
          e.currentTarget.style.transform   = 'translateY(0)'
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LogIn size={18} />
          {isLoading ? 'Verificando...' : 'Entrar al panel'}
        </span>
      </button>

    </form>
  )
}
