import api from './api'

export interface User {
  id: number
  email: string
  fullName: string | null
  role: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface RegisterPayload {
  email: string
  password: string
  fullName: string
}

export interface LoginPayload {
  email: string
  password: string
}

export const login = async (payload: LoginPayload) => {
  const { data } = await api.post<AuthResponse>('/auth/login', payload)
  return data
}

export const register = async (payload: RegisterPayload) => {
  const { data } = await api.post<AuthResponse>('/auth/register', payload)
  return data
}

export interface MessageResponse {
  message: string
}

export const forgotPassword = async (email: string) => {
  const { data } = await api.post<MessageResponse>('/auth/forgot-password', { email })
  return data
}

export const resetPassword = async (token: string, newPassword: string, confirmPassword: string) => {
  const { data } = await api.post<MessageResponse>('/auth/reset-password', {
    token,
    newPassword,
    confirmPassword,
  })
  return data
}

