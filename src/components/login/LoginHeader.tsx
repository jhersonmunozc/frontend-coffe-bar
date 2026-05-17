export function LoginHeader() {
  return (
    <div style={{ marginBottom: 32, animation: 'fadeInUp 0.4s ease 0.10s both' }}>
      <p style={{
        fontSize: 11.5, fontWeight: 600, color: 'var(--cafe)',
        letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 10,
      }}>
        Panel de administración
      </p>
      <h1 style={{
        fontFamily: "'Playfair Display', serif", fontSize: 32,
        color: 'var(--text)', lineHeight: 1.1, marginBottom: 8,
      }}>
        Iniciar sesión
      </h1>
      <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.5 }}>
        Ingresa tus credenciales para continuar al panel de Cafesino.
      </p>
    </div>
  )
}
