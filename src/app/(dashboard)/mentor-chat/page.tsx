"use client"

import { useState, useRef, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useUserJobs } from "@/hooks/use-jobs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Bot, Loader2, Send, MessageSquare, ArrowLeft } from "lucide-react"
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
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleStartChat = () => {
    if (!projectTitle.trim() && !projectDescription.trim()) return
    setShowSetup(false)
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
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: t("error") }])
    } finally {
      setLoading(false)
    }
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
      ) : (
        <Card className="flex flex-col h-[600px]">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b shrink-0">
            <Bot className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium truncate">{projectTitle || "Chat"}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-xs"
              onClick={() => setShowSetup(true)}
            >
              {t("changeProject")}
            </Button>
          </div>

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
