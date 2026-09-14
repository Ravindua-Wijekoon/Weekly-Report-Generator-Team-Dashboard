import { apiClient } from './client'

export async function sendChatMessage({ message, conversationId }) {
  const { data } = await apiClient.post('/ai/chat', { message, conversationId })
  return data
}

export async function listConversations() {
  const { data } = await apiClient.get('/ai/conversations')
  return data.data
}

export async function getConversation(id) {
  const { data } = await apiClient.get(`/ai/conversations/${id}`)
  return data
}

export async function deleteConversation(id) {
  await apiClient.delete(`/ai/conversations/${id}`)
}
