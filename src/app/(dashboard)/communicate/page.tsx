"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { useGenerateDraft } from "@/hooks/use-jobs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { MessageSquare, Loader2, Copy, Check } from "lucide-react"

const draftTypes = [
  { value: "cover_letter", label: "Cover Letter" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "follow_up", label: "Follow Up" },
  { value: "revision", label: "Revision Request" },
]

function CommunicateContent() {
  const searchParams = useSearchParams()
  const jobId = searchParams.get("jobId")

  const [draftType, setDraftType] = useState("proposal")
  const [jobTitle, setJobTitle] = useState("")
  const [clientMessage, setClientMessage] = useState("")
  const [context, setContext] = useState("")
  const [result, setResult] = useState<{ subject: string; body: string; tone: string; key_points: string[] } | null>(null)
  const [copied, setCopied] = useState(false)

  const generateDraft = useGenerateDraft()

  const handleGenerate = async () => {
    if (!jobTitle.trim()) {
      toast.error("Please enter a job title")
      return
    }

    const data = await generateDraft.mutateAsync({
      draftType,
      jobTitle,
      clientMessage: clientMessage || undefined,
      context: context || undefined,
    })

    setResult(data)
    toast.success("Draft generated!")
  }

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result.body)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("Copied to clipboard!")
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Communication Assistant</h1>
        <p className="text-muted-foreground">Professional AI-generated message drafts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Draft Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Draft Type</label>
            <div className="flex flex-wrap gap-2">
              {draftTypes.map((type) => (
                <Badge
                  key={type.value}
                  variant={draftType === type.value ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setDraftType(type.value)}
                >
                  {type.label}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Job Title</label>
            <Input
              placeholder="e.g., WordPress Website Redesign"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Client Message (optional)</label>
            <Textarea
              placeholder="Paste the client's message or job posting..."
              className="min-h-[100px]"
              value={clientMessage}
              onChange={(e) => setClientMessage(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Context (optional)</label>
            <Textarea
              placeholder="Any additional context about this project..."
              className="min-h-[80px]"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>
          <Button onClick={handleGenerate} disabled={generateDraft.isPending}>
            {generateDraft.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                Generate Draft
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{result.subject || "Draft"}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{result.tone}</Badge>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="whitespace-pre-wrap rounded-lg border p-4 text-sm">
              {result.body}
            </div>
            {result.key_points?.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Key Points:</p>
                <ul className="list-disc list-inside space-y-1">
                  {result.key_points.map((point, i) => (
                    <li key={i} className="text-sm text-muted-foreground">{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function CommunicatePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading...</p></div>}>
      <CommunicateContent />
    </Suspense>
  )
}
