import { apiClient } from './client'

export async function listProjects(params = {}) {
  const { data } = await apiClient.get('/projects', { params })
  return data.data
}

export async function createProject(payload) {
  const { data } = await apiClient.post('/projects', payload)
  return data.project
}

export async function updateProject(id, payload) {
  const { data } = await apiClient.patch(`/projects/${id}`, payload)
  return data.project
}

export async function deleteProject(id) {
  await apiClient.delete(`/projects/${id}`)
}
