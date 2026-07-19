"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { useGenerateMentorTasks } from "@/hooks/use-jobs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Bot, Loader2, Clock } from "lucide-react"

interface Task {
  order: number
  title: string
  description: string
  technical_guide: string
  estimated_hours: number
}

interface MentorResult {
  tasks: Task[]
  total_estimated_hours: number
  difficulty: string
  tools_needed: string[]
}

function MentorContent() {
  const searchParams = useSearchParams()
  const jobId = searchParams.get("jobId")

  const [jobTitle, setJobTitle] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [result, setResult] = useState<MentorResult | null>(null)

  const generateTasks = useGenerateMentorTasks()

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description")
      return
    }

    const data = await generateTasks.mutateAsync({
      jobTitle: jobTitle || "Untitled Project",
      jobDescription,
    })

    setResult(data)
    toast.success("Tasks generated!")
  }

  const difficultyColor = (d: string) => {
    if (d === "beginner") return "success"
    if (d === "intermediate") return "warning"
    return "destructive"
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Mentor</h1>
        <p className="text-muted-foreground">Break down projects into actionable micro-tasks.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Job Title</label>
            <Input
              placeholder="e.g., Build a WordPress landing page"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Job Description</label>
            <Textarea
              placeholder="Paste the job description here..."
              className="min-h-[200px]"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
          <Button onClick={handleGenerate} disabled={generateTasks.isPending}>
            {generateTasks.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Bot className="mr-2 h-4 w-4" />
                Generate Tasks
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="flex gap-3">
            <Badge variant={difficultyColor(result.difficulty)}>
              {result.difficulty}
            </Badge>
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              ~{result.total_estimated_hours}h total
            </Badge>
            {result.tools_needed?.map((tool) => (
              <Badge key={tool} variant="outline">{tool}</Badge>
            ))}
          </div>

          <div className="space-y-4">
            {result.tasks.map((task) => (
              <Card key={task.order}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                        {task.order}
                      </span>
                      <CardTitle className="text-base">{task.title}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      ~{task.estimated_hours}h
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                  {task.technical_guide && (
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs font-medium mb-1">Technical Guide:</p>
                      <p className="text-sm whitespace-pre-wrap">{task.technical_guide}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function MentorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading...</p></div>}>
      <MentorContent />
    </Suspense>
  )
}
