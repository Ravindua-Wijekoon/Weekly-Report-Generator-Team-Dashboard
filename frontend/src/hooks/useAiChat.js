import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import * as aiApi from '../api/ai.api'

const CONVERSATIONS_KEY = ['ai', 'conversations']

export function useAiChat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: aiApi.sendChatMessage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY }),
  })
}

export function useConversations() {
  return useQuery({ queryKey: CONVERSATIONS_KEY, queryFn: aiApi.listConversations })
}

export function useConversation(id) {
  return useQuery({
    queryKey: [...CONVERSATIONS_KEY, id],
    queryFn: () => aiApi.getConversation(id),
    enabled: !!id,
  })
}

export function useDeleteConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: aiApi.deleteConversation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY }),
  })
}
