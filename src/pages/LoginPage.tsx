import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Coffee } from 'lucide-react'
import { login } from '../api/authApi'
import { useAuthStore } from '../store/authStore'
import { loginSchema, type LoginFormData } from '../utils/validaciones'
import logoImg from '../assets/hero.png'

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
      if (result.usuario.rol === 'Administrador') {
        navigate('/admin/dashboard')
      } else {
        navigate('/barista/menu')
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setServerError(message ?? 'Error al iniciar sesión. Intenta de nuevo.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cafe-espresso px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={logoImg}
            alt="Cafésino"
            className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-cafe-tostado"
          />
          <h1 className="text-cafe-crema text-2xl font-semibold tracking-wide">
            CAFÉSINO
          </h1>
          <p className="text-cafe-latte text-sm mt-1">Sistema de inventario</p>
        </div>

        {/* Card */}
        <div className="bg-cafe-crema rounded-2xl p-8 shadow-xl">
          <h2 className="text-cafe-espresso text-xl font-semibold mb-6 text-center">
            Iniciar sesión
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-cafe-espresso mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="usuario@cafesino.com"
                {...register('email')}
                className="w-full px-4 py-2.5 rounded-lg border border-cafe-vapor bg-white text-cafe-espresso placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cafe-tostado"
              />
              {errors.email && (
                <p className="text-alerta-critica text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-cafe-espresso mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-cafe-vapor bg-white text-cafe-espresso placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cafe-tostado"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-cafe-tostado"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-alerta-critica text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Error del servidor */}
            {serverError && (
              <p className="text-alerta-critica text-sm text-center bg-red-50 rounded-lg py-2 px-3">
                {serverError}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-cafe-tostado text-white font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="animate-spin"><Coffee size={18} /></span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
