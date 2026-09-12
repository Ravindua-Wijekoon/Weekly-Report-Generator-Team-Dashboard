import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import * as usersApi from '../api/users.api'

const USERS_KEY = ['users']

export function useUsers(params) {
  return useQuery({ queryKey: [...USERS_KEY, params], queryFn: () => usersApi.listUsers(params) })
}

export function useUser(id) {
  return useQuery({
    queryKey: [...USERS_KEY, 'detail', id],
    queryFn: () => usersApi.getUser(id),
    enabled: Boolean(id),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) => usersApi.updateUser(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  })
}
