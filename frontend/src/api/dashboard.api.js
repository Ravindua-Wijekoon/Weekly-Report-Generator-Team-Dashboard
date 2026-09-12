import { apiClient } from './client'

export async function getSummary(week) {
  const { data } = await apiClient.get('/dashboard/summary', { params: { week } })
  return data
}

export async function getTrend(params = {}) {
  const { data } = await apiClient.get('/dashboard/trend', { params })
  return data.data
}

export async function getStatusByMember(week) {
  const { data } = await apiClient.get('/dashboard/status-by-member', { params: { week } })
  return data.data
}

export async function getWorkloadByProject(week) {
  const { data } = await apiClient.get('/dashboard/workload-by-project', { params: { week } })
  return data.data
}

export async function getHoursByType(week) {
  const { data } = await apiClient.get('/dashboard/hours-by-type', { params: { week } })
  return data
}

export async function getActivity(limit) {
  const { data } = await apiClient.get('/dashboard/activity', { params: { limit } })
  return data.data
}

export async function getSection(week, section) {
  const { data } = await apiClient.get('/dashboard/section', { params: { week, section } })
  return data.data
}
