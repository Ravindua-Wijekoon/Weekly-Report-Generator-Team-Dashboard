import { apiClient } from './client'

export async function listUsers(params = {}) {
  const { data } = await apiClient.get('/users', { params })
  return data
}

export async function getUser(id) {
  const { data } = await apiClient.get(`/users/${id}`)
  return data.user
}

export async function createUser(payload) {
  const { data } = await apiClient.post('/users', payload)
  return data.user
}

export async function updateUser(id, payload) {
  const { data } = await apiClient.patch(`/users/${id}`, payload)
  return data.user
}
