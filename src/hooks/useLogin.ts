import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/authApi'
import { useAuthStore } from '../store/authStore'
import { loginSchema, type LoginFormData } from '../utils/validaciones'

export function useLogin() {
  const navigate  = useNavigate()
  const setAuth   = useAuthStore((s) => s.setAuth)
  const [showPassword, setShowPassword] = useState(false)
  const [serverError,  setServerError]  = useState<string | null>(null)
  const [success,      setSuccess]      = useState(false)

  const form = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })
  const { handleSubmit, register, formState: { errors, isSubmitting } } = form

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)
    try {
      const result = await login(data.email, data.password)
      setAuth(result.token, result.usuario)
      setSuccess(true)
      navigate(result.usuario.rol === 'Administrador' ? '/admin/dashboard' : '/barista/menu')
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setServerError(msg ?? 'Error al iniciar sesi?n. Intenta de nuevo.')
    }
  }

  return {
    register,
    errors,
    showPassword,
    toggleShowPassword: () => setShowPassword((v) => !v),
    isLoading: isSubmitting,
    serverError,
    success,
    handleSubmit: handleSubmit(onSubmit),
  }
}
