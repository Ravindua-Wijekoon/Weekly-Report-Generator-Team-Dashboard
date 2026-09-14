import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

import { useConversations, useDeleteConversation } from '../../hooks/useAiChat'
import { SlideOver } from '../common/SlideOver'
import { ConfirmDialog } from '../common/ConfirmDialog'

export function ChatHistoryPanel({ isOpen, onClose, onSelect, onNewChat, activeConversationId, onDeleted }) {
  const { data: conversations = [], isFetching } = useConversations()
  const deleteConversation = useDeleteConversation()
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  if (!isOpen) {
    return null
  }

  async function handleConfirmDelete() {
    const id = pendingDeleteId
    setPendingDeleteId(null)
    await deleteConversation.mutateAsync(id)
    if (id === activeConversationId) {
      onDeleted?.()
    }
  }

  return (
    <>
      <SlideOver title="Chat history" onClose={onClose}>
        <button
          type="button"
          onClick={onNewChat}
          className="w-full flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 mb-4"
        >
          <Plus size={16} />
          New chat
        </button>

        {isFetching && <p className="text-sm text-slate-500">Loading...</p>}

        {!isFetching && conversations.length === 0 && (
          <p className="text-sm text-slate-400">No past conversations yet.</p>
        )}

        <div className="space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation._id}
              className={`flex items-center gap-1 rounded-xl transition-colors ${
                conversation._id === activeConversationId ? 'bg-primary-50' : 'hover:bg-slate-50'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(conversation._id)}
                className={`flex-1 min-w-0 text-left px-3 py-2.5 text-sm ${
                  conversation._id === activeConversationId ? 'text-primary-700' : 'text-slate-700'
                }`}
              >
                <p className="font-medium truncate">{conversation.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{new Date(conversation.updatedAt).toLocaleString()}</p>
              </button>
              <button
                type="button"
                onClick={() => setPendingDeleteId(conversation._id)}
                className="shrink-0 p-2 text-slate-300 hover:text-danger"
                aria-label={`Delete ${conversation.title}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </SlideOver>

      {pendingDeleteId && (
        <ConfirmDialog
          title="Delete conversation"
          message="This chat and all its messages will be permanently deleted. This cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
    </>
  )
}
