"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { useJob, useSaveJob, useAnalyzeJob, useGenerateMentorTasks, useGenerateDraft } from "@/hooks/use-jobs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { motion } from "framer-motion"
import {
  ArrowLeft, Brain, Bookmark, ExternalLink, Trophy, AlertTriangle,
  Clock, DollarSign, Globe, MapPin, Users, BarChart3, MessageSquare,
  ListChecks, Sparkles, CheckCircle2, Loader2, Copy
} from "lucide-react"
import Link from "next/link"

export default function JobDetailPage() {
  const t = useTranslations("jobDetail")
  const c = useTranslations("common")
  const params = useParams()
  const router = useRouter()
  const { data: job, isLoading, error } = useJob(params.id as string)
  const saveJob = useSaveJob()
  const analyzeJob = useAnalyzeJob()
  const generateTasks = useGenerateMentorTasks()
  const generateDraft = useGenerateDraft()
  const [activeTab, setActiveTab] = useState<"overview" | "mentor" | "communicate">("overview")
  const [mentorTasks, setMentorTasks] = useState<any>(null)
  const [draft, setDraft] = useState<any>(null)
  const [draftCopied, setDraftCopied] = useState(false)

  const handleSave = async () => {
    await saveJob.mutateAsync(job!.id)
    toast.success(t("savedToast"))
  }

  const handleAnalyze = async () => {
    if (!job) return
    await analyzeJob.mutateAsync({
      jobId: job.id,
      title: job.title,
      description: job.description,
    })
    toast.success(t("analysisToast"))
  }

  const handleMentorBreakdown = async () => {
    if (!job) return
    const result = await generateTasks.mutateAsync({
      jobTitle: job.title,
      jobDescription: job.description,
    })
    setMentorTasks(result)
    setActiveTab("mentor")
    toast.success(t("tasksToast"))
  }

  const handleGenerateDraft = async () => {
    if (!job) return
    const result = await generateDraft.mutateAsync({
      draftType: "proposal",
      jobTitle: job.title,
    })
    setDraft(result)
    setActiveTab("communicate")
    toast.success(t("draftToast"))
  }

  const handleCopyDraft = async () => {
    if (draft?.body) {
      await navigator.clipboard.writeText(draft.body)
      setDraftCopied(true)
      setTimeout(() => setDraftCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
        <p className="text-destructive font-medium">{t("notFound")}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => router.push("/jobs")}>
          {t("backToJobs")}
        </Button>
      </div>
    )
  }

  const tabs = [
    { id: "overview" as const, label: t("tabOverview"), icon: BarChart3 },
    { id: "mentor" as const, label: t("tabMentor"), icon: ListChecks },
    { id: "communicate" as const, label: t("tabDraft"), icon: MessageSquare },
  ]

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {c("back")}
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
              <Badge variant="secondary">{job.platform}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {job.budget_min && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-foreground">
                    ${job.budget_min}{job.budget_max ? ` - $${job.budget_max}` : "+"}
                  </span>
                </span>
              )}
              {job.posted_at && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(job.posted_at).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric"
                  })}
                </span>
              )}
              {job.client_country && (
                <span className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  {job.client_country}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" onClick={handleSave} disabled={saveJob.isPending}>
              <Bookmark className="mr-2 h-4 w-4" />
              {saveJob.isPending ? c("saving") : t("saveJob")}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={job.url} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                {t("original")}
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        {job.ai_compatibility_score !== null ? (
          <>
            <Badge variant={
              job.ai_compatibility_score >= 70 ? "success" :
              job.ai_compatibility_score >= 40 ? "warning" : "destructive"
            } className="flex items-center gap-1 text-sm px-3 py-1">
              <Brain className="h-4 w-4" />
              {t("aiScore", { score: job.ai_compatibility_score })}
            </Badge>
            {job.ai_risk_level && (
              <Badge variant={
                job.ai_risk_level === "low" ? "success" :
                job.ai_risk_level === "medium" ? "warning" : "destructive"
              } className="flex items-center gap-1 text-sm px-3 py-1">
                <AlertTriangle className="h-4 w-4" />
                {t("riskLabel", { risk: job.ai_risk_level.charAt(0).toUpperCase() + job.ai_risk_level.slice(1) })}
              </Badge>
            )}
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={handleAnalyze} disabled={analyzeJob.isPending}>
            <Brain className="mr-2 h-4 w-4" />
            {analyzeJob.isPending ? t("analyzing") : t("analyzeAI")}
          </Button>
        )}
      </motion.div>

      <div className="flex gap-1 rounded-lg border bg-card p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("description")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {job.description}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {job.skills_required?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {t("skillsRequired")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required.map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  {t("clientInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {job.client_country && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t("country")}</span>
                    <span className="font-medium">{job.client_country}</span>
                  </div>
                )}
                {job.client_rating && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t("rating")}</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                      {job.client_rating.toFixed(1)} / 5.0
                    </span>
                  </div>
                )}
                {job.client_hires !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t("totalHires")}</span>
                    <span className="font-medium">{job.client_hires}</span>
                  </div>
                )}
                {job.job_type && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t("jobType")}</span>
                    <Badge variant="outline" className="text-xs">
                      {job.job_type === "fixed" ? t("fixedPrice") : t("hourly")}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {job.ai_analysis && typeof job.ai_analysis === "object" && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  {t("aiInsights")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {(job.ai_analysis as any).reasoning && (
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-muted-foreground">{(job.ai_analysis as any).reasoning}</p>
                  </div>
                )}
                {(job.ai_analysis as any).red_flags?.length > 0 && (
                  <div>
                    <p className="font-medium mb-2 text-foreground">{t("potentialRisks")}</p>
                    <ul className="space-y-1">
                      {(job.ai_analysis as any).red_flags.map((flag: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                          <AlertTriangle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Separator />

          <div className="flex gap-3">
            <Button onClick={handleMentorBreakdown} disabled={generateTasks.isPending}>
              {generateTasks.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Brain className="mr-2 h-4 w-4" />
              )}
              {t("mentorBreakdown")}
            </Button>
            <Button variant="outline" onClick={handleGenerateDraft} disabled={generateDraft.isPending}>
              {generateDraft.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="mr-2 h-4 w-4" />
              )}
              {t("proposalDraft")}
            </Button>
          </div>
        </motion.div>
      )}

      {activeTab === "mentor" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t("taskBreakdown")}</h2>
            {!mentorTasks && (
              <Button size="sm" onClick={handleMentorBreakdown} disabled={generateTasks.isPending}>
                {generateTasks.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="mr-2 h-4 w-4" />
                )}
                {c("generate")}
              </Button>
            )}
          </div>

          {generateTasks.isPending && (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {mentorTasks && (
            <>
              <div className="flex flex-wrap gap-2">
                <Badge variant={
                  mentorTasks.difficulty === "beginner" ? "success" :
                  mentorTasks.difficulty === "intermediate" ? "warning" : "destructive"
                } className="text-sm px-3 py-1">
                  {mentorTasks.difficulty}
                </Badge>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  {t("totalHours", { hours: mentorTasks.total_estimated_hours })}
                </Badge>
                {mentorTasks.tools_needed?.map((tool: string) => (
                  <Badge key={tool} variant="outline" className="text-sm">{tool}</Badge>
                ))}
              </div>

              <div className="space-y-3">
                {mentorTasks.tasks?.map((task: any) => (
                  <Card key={task.order} className="hover:shadow-[var(--shadow-card-hover)] dark:hover:shadow-[var(--shadow-card-hover-dark)] transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0 mt-0.5">
                          {task.order}
                        </span>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold">{task.title}</h3>
                            <Badge variant="secondary" className="text-xs shrink-0">
                              <Clock className="h-3 w-3 mr-1" />
                              {task.estimated_hours}h
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          {task.technical_guide && (
                            <div className="rounded-lg bg-muted/50 p-3 border text-sm">
                              <p className="text-xs font-semibold text-primary mb-1">{t("technicalGuide")}</p>
                              <p className="text-muted-foreground whitespace-pre-wrap">{task.technical_guide}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {!mentorTasks && !generateTasks.isPending && (
            <Card>
              <CardContent className="py-8 text-center">
                <Brain className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t("mentorEmpty")}
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {activeTab === "communicate" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t("proposalHeading")}</h2>
            {!draft && (
              <Button size="sm" onClick={handleGenerateDraft} disabled={generateDraft.isPending}>
                {generateDraft.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquare className="mr-2 h-4 w-4" />
                )}
                {c("generate")}
              </Button>
            )}
          </div>

          {generateDraft.isPending && (
            <Card>
              <CardContent className="py-8 text-center">
                <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">{t("generating")}</p>
              </CardContent>
            </Card>
          )}

          {draft && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{draft.subject || t("proposalHeading")}</CardTitle>
                  <Badge variant="secondary">{draft.tone}</Badge>
                </div>
                <Button variant="outline" size="sm" onClick={handleCopyDraft}>
                  {draftCopied ? (
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4" />
                  )}
                  {draftCopied ? c("copied") : c("copy")}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="whitespace-pre-wrap rounded-lg border bg-muted/30 p-6 text-sm leading-relaxed">
                  {draft.body}
                </div>
                {draft.key_points?.length > 0 && (
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {t("keyPoints")}
                    </p>
                    <ul className="space-y-1.5">
                      {draft.key_points.map((point: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!draft && !generateDraft.isPending && (
            <Card>
              <CardContent className="py-8 text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t("draftEmpty")}
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  )
}
