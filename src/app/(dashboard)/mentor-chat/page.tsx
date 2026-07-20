"use client"

import { useState, useRef, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useUserJobs, useSaveChatHistory, useChatHistory, useDeleteChatHistory } from "@/hooks/use-jobs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Bot, Loader2, Send, MessageSquare, ArrowLeft, Save, History, Trash2, Check } from "lucide-react"
import Link from "next/link"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export default function MentorChatPage() {
  const t = useTranslations("mentorChat")
  const { data: userJobs } = useUserJobs()

  const [projectTitle, setProjectTitle] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [tasks, setTasks] = useState<any[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: t("welcomeMessage") },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [showSetup, setShowSetup] = useState(true)
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

  const handleStartChat = () => {
    if (!projectTitle.trim() && !projectDescription.trim()) return
    setShowSetup(false)
    setSaved(false)
    setMessages([
      { role: "assistant", content: t("chatReady", { title: projectTitle || "Project" }) },
    ])
  }

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
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer || t("error") }])
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
          setProjectTitle(data.project_title || "")
          setProjectDescription(data.project_description || "")
          setTasks(data.tasks || [])
          setSaved(true)
          setShowSetup(false)
          setShowHistory(false)
        }
      })
      .catch(() => {})
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/mentor" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      {showSetup ? (
        <div className="grid gap-6 md:grid-cols-[1fr_280px]">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>{t("projectTitle")}</Label>
                <Input
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder={t("projectTitlePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("projectDesc")}</Label>
                <Textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="min-h-[120px]"
                  placeholder={t("projectDescPlaceholder")}
                />
              </div>
              <Button onClick={handleStartChat} disabled={!projectTitle.trim() && !projectDescription.trim()}>
                <MessageSquare className="mr-2 h-4 w-4" />
                {t("startChat")}
              </Button>
            </CardContent>
          </Card>

          {/* History Panel (sidebar when in setup mode) */}
          <Card className="h-fit">
            <CardContent className="p-4 space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <History className="h-4 w-4" />
                {t("savedChats")}
              </h3>
              {historyList?.length === 0 && (
                <p className="text-xs text-muted-foreground">{t("noSavedChats")}</p>
              )}
              {historyList?.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center gap-1 p-2 rounded-lg hover:bg-accent group cursor-pointer text-sm"
                >
                  <button
                    onClick={() => handleLoadHistory(h.id)}
                    className="flex-1 text-left truncate"
                  >
                    <span className="font-medium">{h.title}</span>
                    <p className="text-xs text-muted-foreground">
                      {new Date(h.created_at).toLocaleDateString()}
                    </p>
                  </button>
                  <button
                    onClick={() => deleteChat.mutate(h.id)}
                    className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="flex flex-col h-[600px]">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b shrink-0">
            <Bot className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium truncate flex-1">{projectTitle || "Chat"}</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={handleSave}
              disabled={saveChat.isPending}
            >
              {saveChat.isPending ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : saved ? (
                <Check className="h-3 w-3 mr-1" />
              ) : (
                <Save className="h-3 w-3 mr-1" />
              )}
              {saved ? t("saved") : t("saveChat")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="h-3 w-3 mr-1" />
              {t("history")}
            </Button>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowSetup(true)}>
              {t("changeProject")}
            </Button>
          </div>

          {/* History Panel (dropdown) */}
          {showHistory && (
            <div className="border-b border-gray-200 dark:border-gray-700 bg-muted/50 max-h-[180px] overflow-y-auto shrink-0">
              <div className="p-2 space-y-1">
                {historyList?.length === 0 && (
                  <p className="text-xs text-muted-foreground px-2 py-2">{t("noSavedChats")}</p>
                )}
                {historyList?.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-accent group cursor-pointer"
                  >
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
                      onClick={() => deleteChat.mutate(h.id)}
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
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm bg-muted text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {t("thinking")}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-4 shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend() }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("inputPlaceholder")}
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </Card>
      )}
    </div>
  )
}
