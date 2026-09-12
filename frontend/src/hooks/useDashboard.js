import { useQuery } from '@tanstack/react-query'

import * as dashboardApi from '../api/dashboard.api'

export function useDashboardSummary(week) {
  return useQuery({ queryKey: ['dashboard', 'summary', week], queryFn: () => dashboardApi.getSummary(week) })
}

export function useDashboardTrend(params) {
  return useQuery({ queryKey: ['dashboard', 'trend', params], queryFn: () => dashboardApi.getTrend(params) })
}

export function useStatusByMember(week) {
  return useQuery({
    queryKey: ['dashboard', 'status-by-member', week],
    queryFn: () => dashboardApi.getStatusByMember(week),
  })
}

export function useWorkloadByProject(week) {
  return useQuery({
    queryKey: ['dashboard', 'workload-by-project', week],
    queryFn: () => dashboardApi.getWorkloadByProject(week),
  })
}

export function useHoursByType(week) {
  return useQuery({
    queryKey: ['dashboard', 'hours-by-type', week],
    queryFn: () => dashboardApi.getHoursByType(week),
  })
}

export function useActivity(limit = 20) {
  return useQuery({ queryKey: ['dashboard', 'activity', limit], queryFn: () => dashboardApi.getActivity(limit) })
}

export function useSection(week, section) {
  return useQuery({
    queryKey: ['dashboard', 'section', week, section],
    queryFn: () => dashboardApi.getSection(week, section),
  })
}
