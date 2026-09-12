import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import * as reportsApi from '../api/reports.api'

const REPORTS_KEY = ['reports']

export function useReports(params) {
  return useQuery({
    queryKey: [...REPORTS_KEY, params],
    queryFn: () => reportsApi.listReports(params),
  })
}

export function useCreateReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reportsApi.createReport,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: REPORTS_KEY }),
  })
}

export function useUpdateReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) => reportsApi.updateReport(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: REPORTS_KEY }),
  })
}
