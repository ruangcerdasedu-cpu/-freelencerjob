"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { useGenerateMentorTasks } from "@/hooks/use-jobs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { MentorChat } from "@/components/mentor-chat"
import { Bot, Loader2, Clock, Sparkles, Target, Trophy, ExternalLink, User, Cpu, BookOpen, Play, MessageCircle } from "lucide-react"

interface AiTool {
  name: string
  how_to_use: string
}

interface ToolInTask {
  name: string
  cost: string
  cost_detail: string
  url: string
  beginner_friendly: boolean
  tutorial_url?: string
}

interface Task {
  order: number
  title: string
  description: string
  assignee: "ai" | "human" | "both"
  completion_percentage: number
  estimated_hours: number
  sub_steps: string[]
  technical_guide: string
  tools: ToolInTask[]
  tutorial_url: string
  deliverable: string
  ai_tools: AiTool[]
}

interface ToolRecommendation {
  name: string
  use_case: string
  url: string
  cost: string
  cost_detail: string
  beginner_friendly: boolean
  alternative_free: string | null
}

interface CompetitiveAdvantage {
  point: string
  action: string
}

interface MentorResult {
  project_summary: string
  difficulty: string
  total_completion_percentage: number
  estimated_duration: string
  tools_recommended: ToolRecommendation[]
  tasks: Task[]
  competitive_advantages: CompetitiveAdvantage[]
  final_deliverable: string
}

function assigneeIcon(assignee: string) {
  if (assignee === "ai") return <Cpu className="h-3 w-3" />
  if (assignee === "both") return <Sparkles className="h-3 w-3" />
  return <User className="h-3 w-3" />
}

function assigneeColor(assignee: string) {
  if (assignee === "ai") return "bg-purple-500/10 text-purple-600 dark:text-purple-400"
  if (assignee === "both") return "bg-amber-500/10 text-amber-600 dark:text-amber-400"
  return "bg-blue-500/10 text-blue-600 dark:text-blue-400"
}

function assigneeLabel(assignee: string, t: (key: string) => string) {
  if (assignee === "ai") return t("assigneeAi")
  if (assignee === "both") return t("assigneeBoth")
  return t("assigneeHuman")
}

function MentorContent() {
  const t = useTranslations("mentor")
  const searchParams = useSearchParams()
  const jobId = searchParams.get("jobId")

  const [jobTitle, setJobTitle] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [result, setResult] = useState<MentorResult | null>(null)
  const [chatOpen, setChatOpen] = useState(false)

  const generateTasks = useGenerateMentorTasks()

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      toast.error(t("validation"))
      return
    }

    const data = await generateTasks.mutateAsync({
      jobTitle: jobTitle || "Untitled Project",
      jobDescription,
    })

    setResult(data)
    toast.success(t("successToast"))
  }

  const difficultyColor = (d: string) => {
    if (d === "beginner") return "success"
    if (d === "intermediate") return "warning"
    return "destructive"
  }

  const costBadgeColor = (cost: string) => {
    if (cost === "free") return "success"
    if (cost === "freemium") return "warning"
    return "destructive"
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("jobDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("jobTitle")}</label>
            <Input
              placeholder={t("jobTitlePlaceholder")}
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("jobDesc")}</label>
            <Textarea
              placeholder={t("jobDescPlaceholder")}
              className="min-h-[200px]"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
          <Button onClick={handleGenerate} disabled={generateTasks.isPending}>
            {generateTasks.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("generating")}
              </>
            ) : (
              <>
                <Bot className="mr-2 h-4 w-4" />
                {t("generateTasks")}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Summary Banner */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 space-y-4">
              <p className="text-sm leading-relaxed">{result.project_summary}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant={difficultyColor(result.difficulty)}>
                  {t("difficulty")}: {result.difficulty}
                </Badge>
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  {result.estimated_duration}
                </Badge>
                <Badge variant="secondary">
                  <Target className="h-3 w-3 mr-1" />
                  {result.total_completion_percentage}% {t("feasible")}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* AI Tools Recommendation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                {t("aiTools")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {result.tools_recommended?.map((tool) => (
                  <a
                    key={tool.name}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-medium">{tool.name}</span>
                        <Badge variant={costBadgeColor(tool.cost)} className="text-[10px]">
                          {tool.cost_detail}
                        </Badge>
                        {tool.beginner_friendly && (
                          <Badge variant="secondary" className="text-[10px]">
                            ✅ Pemula
                          </Badge>
                        )}
                        <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{tool.use_case}</p>
                      {tool.cost !== "free" && tool.alternative_free && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                          🆓 Alternatif gratis: {tool.alternative_free}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tasks Breakdown */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bot className="h-4 w-4" />
              {t("taskBreakdown")}
            </h3>
            {result.tasks?.map((task) => (
              <Card key={task.order}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                        {task.order}
                      </span>
                      <CardTitle className="text-base truncate">{task.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className={assigneeColor(task.assignee)}>
                        {assigneeIcon(task.assignee)}
                        <span className="ml-1">{assigneeLabel(task.assignee, t)}</span>
                      </Badge>
                      <Badge variant="secondary" className="text-xs whitespace-nowrap">
                        <Clock className="h-3 w-3 mr-1" />
                        ~{task.estimated_hours}h
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>{t("projectProgress")}</span>
                      <span>{task.completion_percentage}%</span>
                    </div>
                    <Progress value={task.completion_percentage} className="h-1.5" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <p className="text-sm text-muted-foreground">{task.description}</p>

                  {/* Sub Steps */}
                  {task.sub_steps?.length > 0 && (
                    <div className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 p-3 space-y-2">
                      <p className="text-xs font-semibold flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                        <BookOpen className="h-3 w-3" />
                        Langkah Detail
                      </p>
                      <ol className="list-decimal list-inside space-y-1">
                        {task.sub_steps.map((step, i) => (
                          <li key={i} className="text-sm text-muted-foreground">{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Task-specific Tools */}
                  {task.tools?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {task.tools.map((tool) => (
                        <a
                          key={tool.name}
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-accent">
                            {tool.name}
                            <span className="ml-1">{tool.cost_detail}</span>
                          </Badge>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Tutorial Link */}
                  {task.tutorial_url && (
                    <a
                      href={task.tutorial_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <Play className="h-3 w-3" />
                      Tutorial: {task.title}
                    </a>
                  )}

                  {/* AI Tools for Task */}
                  {task.ai_tools?.length > 0 && (
                    <div className="rounded-lg border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/30 p-3 space-y-2">
                      <p className="text-xs font-semibold flex items-center gap-1.5 text-purple-700 dark:text-purple-300">
                        <Sparkles className="h-3 w-3" />
                        {t("aiToolsForTask")}
                      </p>
                      {task.ai_tools.map((aiTool) => (
                        <div key={aiTool.name} className="text-sm">
                          <span className="font-medium text-foreground">{aiTool.name}:</span>{" "}
                          <span className="text-muted-foreground">{aiTool.how_to_use}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {task.technical_guide && (
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs font-medium mb-1">{t("technicalGuide")}</p>
                      <p className="text-sm whitespace-pre-wrap text-muted-foreground">{task.technical_guide}</p>
                    </div>
                  )}

                  {task.deliverable && (
                    <div className="flex items-start gap-2 text-sm">
                      <Trophy className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium">{t("deliverable")}:</span>{" "}
                        <span className="text-muted-foreground">{task.deliverable}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Final Deliverable */}
          <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="h-4 w-4 text-emerald-600" />
                {t("finalDeliverable")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{result.final_deliverable}</p>
            </CardContent>
          </Card>

          {/* Competitive Advantages */}
          {result.competitive_advantages?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4 text-primary" />
                  {t("winStrategy")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.competitive_advantages.map((adv, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-sm font-medium">{adv.point}</p>
                    <p className="text-sm text-muted-foreground pl-4 border-l-2 border-primary/30">{adv.action}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Floating Chat Button */}
      {result && (
        <MentorChat
          open={chatOpen}
          onOpenChange={setChatOpen}
          projectTitle={jobTitle || "Untitled Project"}
          projectDescription={jobDescription}
          tasks={result.tasks}
        />
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
