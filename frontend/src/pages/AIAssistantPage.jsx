import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { History, Send, Sparkles } from 'lucide-react'

import { useAiChat, useConversation } from '../hooks/useAiChat'
import { renderMarkdown } from '../lib/markdown'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { ChatHistoryPanel } from '../components/ai/ChatHistoryPanel'

const STARTER_PROMPTS = [
  'What did the team work on this week?',
  "Who hasn't submitted their report yet?",
  'Summarize this week for me',
  'What blockers is the team facing right now?',
]

function toDisplayMessages(rawMessages) {
  return rawMessages.map((message) => ({ role: message.role, text: message.text, sources: message.sources }))
}

export default function AIAssistantPage() {
  const [conversationId, setConversationId] = useState(null)
  const [localMessages, setLocalMessages] = useState([])
  const [input, setInput] = useState('')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const chat = useAiChat()
  const location = useLocation()
  const navigate = useNavigate()
  const hasAutoSent = useRef(false)

  const { data: loadedConversation, isFetching: isLoadingConversation } = useConversation(conversationId)

  const isViewingLoadedConversation = conversationId && localMessages === null
  const messages = isViewingLoadedConversation
    ? toDisplayMessages(loadedConversation?.messages || [])
    : localMessages

  async function handleSend(text) {
    const trimmed = text.trim()
    if (!trimmed || chat.isPending) return

    const baseMessages = isViewingLoadedConversation ? toDisplayMessages(loadedConversation?.messages || []) : localMessages
    setLocalMessages([...baseMessages, { role: 'user', text: trimmed }])
    setInput('')

    try {
      const result = await chat.mutateAsync({ message: trimmed, conversationId })
      setConversationId(result.conversationId)
      setLocalMessages((prev) => [...prev, { role: 'model', text: result.reply, sources: result.sources }])
    } catch (err) {
      const message = err.response?.data?.error || 'Something went wrong. Please try again.'
      setLocalMessages((prev) => [...prev, { role: 'model', text: message, isError: true }])
    }
  }

  function handleNewChat() {
    setConversationId(null)
    setLocalMessages([])
    setIsHistoryOpen(false)
  }

  function handleSelectConversation(id) {
    setConversationId(id)
    setLocalMessages(null)
    setIsHistoryOpen(false)
  }

  useEffect(() => {
    const incomingPrompt = location.state?.prompt
    if (incomingPrompt && !hasAutoSent.current) {
      hasAutoSent.current = true
      navigate(location.pathname, { replace: true })
      handleSend(incomingPrompt)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl text-slate-900 flex items-center gap-2">
            <Sparkles size={22} className="text-primary-600" />
            AI Assistant
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ask about team activity and weekly reports. Answers are generated using Google's Gemini API; relevant
            report data may be sent to Google to answer your question.
          </p>
        </div>
        <Button variant="outline" className="px-3 py-1.5 flex items-center gap-1.5" onClick={() => setIsHistoryOpen(true)}>
          <History size={14} />
          History
        </Button>
      </div>

      <Card className="flex flex-col h-[calc(100vh-14rem)]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {isViewingLoadedConversation && isLoadingConversation && (
            <p className="text-sm text-slate-400 text-center">Loading conversation...</p>
          )}

          {messages.length === 0 && !(isViewingLoadedConversation && isLoadingConversation) && (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-slate-400">Try asking one of these</p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="text-sm px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white whitespace-pre-wrap'
                    : message.isError
                    ? 'bg-red-50 text-danger whitespace-pre-wrap'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {message.role === 'user' || message.isError ? (
                  <p>{message.text}</p>
                ) : (
                  <div className="chat-markdown" dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }} />
                )}
                {message.sources?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {message.sources.map((source) => (
                      <Link
                        key={source.id}
                        to={`/reports/${source.id}`}
                        className="text-xs px-2 py-1 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-primary-700 hover:border-primary-200"
                      >
                        {source.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {chat.isPending && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-2.5 text-sm bg-slate-100 text-slate-400">Thinking...</div>
            </div>
          )}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            handleSend(input)
          }}
          className="flex items-center gap-2 pt-4 border-t border-slate-100 mt-4"
        >
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about your team's reports..."
            className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          <Button type="submit" variant="primary" className="px-4 py-2" disabled={chat.isPending || !input.trim()}>
            <Send size={16} />
          </Button>
        </form>
      </Card>

      <ChatHistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
        activeConversationId={conversationId}
        onDeleted={handleNewChat}
      />
    </div>
  )
}
