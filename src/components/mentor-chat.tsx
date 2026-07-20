"use client"

import { useState, useRef, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Loader2, Send, X, Bot, Sparkles, Save, History, Trash2, Check } from "lucide-react"
import { useSaveChatHistory, useChatHistory, useDeleteChatHistory } from "@/hooks/use-jobs"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface MentorChatProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectTitle: string
  projectDescription: string
  tasks: any[]
}

export function MentorChat({ open, onOpenChange, projectTitle, projectDescription, tasks }: MentorChatProps) {
  const t = useTranslations("mentorChat")
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: t("welcomeMessage") },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [saved, setSaved] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: historyList } = useChatHistory()
  const saveChat = useSaveChatHistory()
  const deleteChat = useDeleteChatHistory()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch("/api/ai/mentor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectTitle,
          projectDescription,
          tasks,
          userQuestion: userMsg,
          chatHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json()
      const answer = data.answer || t("error")
      setMessages((prev) => [...prev, { role: "assistant", content: answer }])
      setSaved(false)
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: t("error") }])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    const title = projectTitle || "Untitled Chat"
    saveChat.mutate(
      {
        title,
        project_title: projectTitle,
        project_description: projectDescription,
        tasks,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      },
      { onSuccess: () => setSaved(true) },
    )
  }

  const handleLoadHistory = (id: string) => {
    fetch(`/api/chat-history/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) {
          setMessages(data.messages)
          setSaved(true)
          setShowHistory(false)
        }
      })
      .catch(() => {})
  }

  const handleDeleteHistory = (id: string) => {
    deleteChat.mutate(id)
  }

  return (
    <>
      {/* Floating chat bubble button */}
      <button
        onClick={() => onOpenChange(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 transition-all hover:scale-105"
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] h-[480px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-600 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">AI Mentor Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
                  <span className="text-xs text-emerald-100">Online (AI Assistant)</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleSave}
                disabled={saveChat.isPending}
                className="text-white/80 hover:text-white transition-colors p-1"
                title={t("saveChat")}
              >
                {saveChat.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saved ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-white/80 hover:text-white transition-colors p-1"
                title={t("history")}
              >
                <History className="h-4 w-4" />
              </button>
              <button
                onClick={() => onOpenChange(false)}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* History Panel */}
          {showHistory && (
            <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 max-h-[200px] overflow-y-auto shrink-0">
              <div className="p-2 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground px-2 pt-1 pb-1">{t("savedChats")}</p>
                {historyList?.length === 0 && (
                  <p className="text-xs text-muted-foreground px-2 py-2">{t("noSavedChats")}</p>
                )}
                {historyList?.map((h) => (
                  <div key={h.id} className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-accent group cursor-pointer">
                    <button
                      onClick={() => handleLoadHistory(h.id)}
                      className="flex-1 text-left text-xs truncate"
                    >
                      <span className="font-medium">{h.title}</span>
                      <span className="text-muted-foreground ml-2">
                        {new Date(h.created_at).toLocaleDateString()}
                      </span>
                    </button>
                    <button
                      onClick={() => handleDeleteHistory(h.id)}
                      className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mr-2 mt-1">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white rounded-br-md"
                      : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-md shadow-sm border border-gray-100 dark:border-gray-600"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mr-2 mt-1">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="max-w-[80%] rounded-2xl rounded-bl-md px-4 py-3 bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin text-emerald-500" />
                  <span className="text-sm text-gray-500">{t("thinking")}</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 shrink-0 bg-white dark:bg-gray-900">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend() }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("inputPlaceholder")}
                disabled={loading}
                className="flex-1 rounded-full border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus-visible:ring-emerald-500"
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading || !input.trim()}
                className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white h-9 w-9"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center py-1.5 text-[10px] text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
            Didukung oleh Opencode AI
          </div>
        </div>
      )}
    </>
  )
}
