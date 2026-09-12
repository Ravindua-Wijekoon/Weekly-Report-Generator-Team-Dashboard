import { apiClient } from './client'

export async function listReports(params = {}) {
  const { data } = await apiClient.get('/reports', { params })
  return data
}

export async function getReport(id) {
  const { data } = await apiClient.get(`/reports/${id}`)
  return data.report
}

export async function createReport(payload) {
  const { data } = await apiClient.post('/reports', payload)
  return data.report
}

export async function updateReport(id, payload) {
  const { data } = await apiClient.patch(`/reports/${id}`, payload)
  return data.report
}
