import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { login } from '../api/authApi'
import { useAuthStore } from '../store/authStore'
import { loginSchema, type LoginFormData } from '../utils/validaciones'
import logo from '../assets/cafesino-logo.png'
import bg from '../assets/cafesino-bg.jpg'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)
    try {
      const result = await login(data.email, data.password)
      setAuth(result.token, result.usuario)
      navigate(result.usuario.rol === 'Administrador' ? '/admin/dashboard' : '/barista/menu')
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setServerError(msg ?? 'Error al iniciar sesion. Intenta de nuevo.')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 w-full max-w-sm">

        {/* Logo y nombre */}
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-cafe-latte shadow-xl">
            <img src={logo} alt="Cafesino" className="w-full h-full object-cover" />
          </div>
          <p className="text-cafe-latte text-sm tracking-widest uppercase">
            Sistema de inventario
          </p>
        </div>

        {/* Tarjeta estilo imagen referencia */}
        <div
          className="rounded-2xl px-8 py-8"
          style={{ background: 'rgba(20, 12, 6, 0.72)', backdropFilter: 'blur(6px)' }}
        >
          {/* Titulo dorado estilo referencia */}
          <h2
            className="text-center text-2xl font-extrabold mb-8 tracking-wide"
            style={{ color: '#C4956A', fontFamily: 'Georgia, serif' }}
          >
            Iniciar sesion
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">

            {/* Email */}
            <div>
              <label className="block text-white font-bold text-sm mb-2">
                Correo electronico
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="usuario@cafesino.com"
                {...register('email')}
                className="w-full bg-transparent border-0 border-b border-cafe-latte/60 pb-2 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-cafe-latte transition"
              />
              {errors.email && (
                <p className="text-alerta-critica text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Contrasena */}
            <div>
              <label className="block text-white font-bold text-sm mb-2">
                Contrasena
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="????????"
                  {...register('password')}
                  className="w-full bg-transparent border-0 border-b border-cafe-latte/60 pb-2 pr-8 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-cafe-latte transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-0 bottom-2 text-gray-400 hover:text-cafe-latte transition"
                  aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-alerta-critica text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Error servidor */}
            {serverError && (
              <div className="rounded-lg bg-red-900/40 border border-alerta-critica/50 px-4 py-2.5 text-alerta-critica text-sm text-center">
                {serverError}
              </div>
            )}

            {/* Boton tipo pilldora ? igual a la imagen */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 mt-2 rounded-full font-semibold text-sm tracking-widest uppercase transition disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
              style={{ background: '#C4956A', color: '#1a0e06' }}
            >
              {isSubmitting ? 'Verificando...' : 'Entrar'}
            </button>

          </form>

          {/* Footer */}
          <p className="text-gray-400 text-xs text-center mt-6">
            Solo personal autorizado &mdash; Cafesino
          </p>
        </div>

      </div>
    </div>
  )
}
