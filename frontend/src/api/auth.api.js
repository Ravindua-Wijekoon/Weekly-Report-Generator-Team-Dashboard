import { apiClient } from './client'

export async function register(payload) {
  const { data } = await apiClient.post('/auth/register', payload)
  return data.user
}

export async function login(payload) {
  const { data } = await apiClient.post('/auth/login', payload)
  return data.user
}

export async function logout() {
  await apiClient.post('/auth/logout')
}

export async function getMe() {
  try {
    const { data } = await apiClient.get('/auth/me')
    return data.user
  } catch (error) {
    if (error.response?.status === 401) {
      return null
    }
    throw error
  }
}
