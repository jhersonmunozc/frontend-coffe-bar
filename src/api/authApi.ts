import axiosInstance from './axiosInstance'
import type { LoginResponse } from '../types/cafesino.types'

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<LoginResponse>('/login', { email, password })
  return data
}

export async function logout(): Promise<void> {
  await axiosInstance.post('/logout')
}
