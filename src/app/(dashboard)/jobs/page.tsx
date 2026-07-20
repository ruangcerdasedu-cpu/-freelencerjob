"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useJobs, useSaveJob, useAnalyzeJob, useTriggerScrape, useManualJob, useRssScrape } from "@/hooks/use-jobs"
import { useProfile } from "@/hooks/use-profile"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { JobCardSkeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Search, Brain, Bookmark, RefreshCw,
  DollarSign, Clock, LayoutGrid, List, Filter,
  ArrowUpDown, Plus, Rss, ExternalLink, Globe, MapPin
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { motion } from "framer-motion"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
}

export default function JobsPage() {
  const t = useTranslations("jobs")
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"list" | "grid">("list")
  const [showFilters, setShowFilters] = useState(false)
  const [filter, setFilter] = useState<{ platform?: string; risk?: string; source?: string; locale?: string }>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ title: "", description: "", url: "", budget_min: "", budget_max: "", currency: "USD", skills: "", client_country: "", locale: "LN" })
  const { data: jobs, isLoading, error } = useJobs({ search: search || undefined, platform: filter.platform, riskLevel: filter.risk, source: filter.source, locale: filter.locale })
  const saveJob = useSaveJob()
  const analyzeJob = useAnalyzeJob()
  const triggerScrape = useTriggerScrape()
  const manualJob = useManualJob()
  const rssScrape = useRssScrape()
  const { data: profile } = useProfile()

  const handleSave = async (jobId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await saveJob.mutateAsync(jobId)
    toast.success(t("savedToast"))
  }

  const handleAnalyze = async (jobId: string, title: string, description: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await analyzeJob.mutateAsync({ jobId, title, description, userSkills: profile?.skills })
    toast.success(t("analysisToast"))
  }

  const handleScrape = async () => {
    await triggerScrape.mutateAsync()
    toast.success(t("scrapeToast"))
  }

  const handleAddJob = async () => {
    if (!form.title.trim()) {
      toast.error(t("jobTitleRequired"))
      return
    }
    if (!form.description.trim()) {
      toast.error(t("jobDescRequired"))
      return
    }
    await manualJob.mutateAsync({
      title: form.title,
      description: form.description,
      url: form.url || undefined,
      budget_min: form.budget_min ? Number(form.budget_min) : undefined,
      budget_max: form.budget_max ? Number(form.budget_max) : undefined,
      currency: form.currency,
      skills: form.skills || undefined,
      client_country: form.client_country || undefined,
      locale: form.locale,
    })
    toast.success(t("addSuccess"))
    setDialogOpen(false)
    setForm({ title: "", description: "", url: "", budget_min: "", budget_max: "", currency: "USD", skills: "", client_country: "", locale: "LN" })
  }

  const scoreColor = (score: number | null) => {
    if (score === null) return "default"
    if (score >= 70) return "success"
    if (score >= 40) return "warning"
    return "destructive"
  }

  const scoreLabel = (score: number | null) => {
    if (score === null) return t("na")
    if (score >= 70) return t("highMatch")
    if (score >= 40) return t("mediumMatch")
    return t("lowMatch")
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                {t("addJob")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{t("addJobTitle")}</DialogTitle>
                <DialogDescription>{t("addJobDesc")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>{t("jobTitleLabel")}</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t("jobDescLabel")}</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-[100px]" />
                </div>
                <div className="space-y-2">
                  <Label>{t("jobUrlLabel")}</Label>
                  <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>{t("budgetMin")}</Label>
                    <Input type="number" value={form.budget_min} onChange={(e) => setForm({ ...form, budget_min: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("budgetMax")}</Label>
                    <Input type="number" value={form.budget_max} onChange={(e) => setForm({ ...form, budget_max: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("currencyLabel")}</Label>
                    <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                      <option value="USD">USD</option>
                      <option value="IDR">IDR</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("localeLabel")}</Label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.locale}
                    onChange={(e) => setForm({ ...form, locale: e.target.value })}
                  >
                    <option value="LN">{t("localeLn")}</option>
                    <option value="DN">{t("localeDn")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>{t("skillsLabel")}</Label>
                  <Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t("clientCountryLabel")}</Label>
                  <Input value={form.client_country} onChange={(e) => setForm({ ...form, client_country: e.target.value })} />
                </div>
                <Button className="w-full" onClick={handleAddJob} disabled={manualJob.isPending}>
                  {manualJob.isPending ? t("scraping") : t("addJob")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={handleScrape} disabled={triggerScrape.isPending}>
            <RefreshCw className={`mr-2 h-4 w-4 ${triggerScrape.isPending ? "animate-spin" : ""}`} />
            {triggerScrape.isPending ? t("scraping") : t("scrapeNow")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => rssScrape.mutateAsync().then(() => toast.success(t("rssToast")))} disabled={rssScrape.isPending}>
            <Rss className={`mr-2 h-4 w-4 ${rssScrape.isPending ? "animate-spin" : ""}`} />
            {rssScrape.isPending ? t("fetching") : t("rssFeed")}
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            className="pl-9 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          className="h-10"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="mr-2 h-4 w-4" />
          {t("filters")}
        </Button>
        <div className="flex rounded-md border">
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="sm"
            className="h-10 rounded-r-none"
            onClick={() => setView("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="sm"
            className="h-10 rounded-l-none"
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-wrap gap-3 rounded-xl border bg-card p-4"
        >
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">{t("platform")}</label>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={filter.platform || ""}
              onChange={(e) => setFilter({ ...filter, platform: e.target.value || undefined })}
            >
              <option value="">{t("allPlatforms")}</option>
              <option value="upwork">Upwork</option>
              <option value="freelancer">Freelancer</option>
              <option value="fiverr">Fiverr</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">{t("locale")}</label>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={filter.locale || ""}
              onChange={(e) => setFilter({ ...filter, locale: e.target.value || undefined })}
            >
              <option value="">{t("allLocales")}</option>
              <option value="LN">{t("localeLn")}</option>
              <option value="DN">{t("localeDn")}</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Source</label>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={filter.source || ""}
              onChange={(e) => setFilter({ ...filter, source: e.target.value || undefined })}
            >
              <option value="">All</option>
              <option value="scraped">Scraped</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">{t("riskLevel")}</label>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={filter.risk || ""}
              onChange={(e) => setFilter({ ...filter, risk: e.target.value || undefined })}
            >
              <option value="">{t("allRisk")}</option>
              <option value="low">{t("lowRisk")}</option>
              <option value="medium">{t("mediumRisk")}</option>
              <option value="high">{t("highRisk")}</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="ghost"
              size="sm"
              className="h-9"
              onClick={() => setFilter({})}
            >
              {t("clearFilters")}
            </Button>
          </div>
        </motion.div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          {jobs ? (
            <span className="font-medium text-foreground">{jobs.length}</span>
          ) : (
            "-"
          )}{" "}
          {t("jobsFound", { count: jobs?.length ?? 0 })}
        </p>
        <div className="flex items-center gap-1">
          <ArrowUpDown className="h-3 w-3" />
          <span>{t("newestFirst")}</span>
        </div>
      </div>

      {isLoading && (
        <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
          {Array.from({ length: 6 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive">{t("loadError")}</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && jobs?.length === 0 && (
        <EmptyState
          icon="search"
          title={t("noJobsFound")}
          description={
            search || filter.platform || filter.risk
              ? t("noJobsSearch")
              : t("noJobsScrape")
          }
          action={
            search || filter.platform || filter.risk
              ? { label: t("clearFilters"), onClick: () => { setSearch(""); setFilter({}) } }
              : { label: t("scrapeNow"), onClick: handleScrape }
          }
        />
      )}

      {!isLoading && jobs && jobs.length > 0 && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className={view === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}
        >
          {jobs.map((job) => (
            <motion.div key={job.id} variants={item}>
              <Link href={`/jobs/${job.id}`}>
                <Card className="group transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] dark:hover:shadow-[var(--shadow-card-hover-dark)] hover:border-primary/20 cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs font-normal">
                            {job.external_id?.startsWith?.("manual_") ? "Manual" : job.platform}
                          </Badge>
                          <Badge variant="outline" className={`text-xs font-normal ${
                            job.locale === "DN" ? "border-emerald-300 text-emerald-700 dark:text-emerald-400 dark:border-emerald-700" : "border-blue-300 text-blue-700 dark:text-blue-400 dark:border-blue-700"
                          }`}>
                            {job.locale === "DN" ? <MapPin className="h-3 w-3 mr-0.5" /> : <Globe className="h-3 w-3 mr-0.5" />}
                            {job.locale === "DN" ? "DN" : "LN"}
                          </Badge>
                          {job.budget_min && (
                            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                              <DollarSign className="h-3 w-3" />
                              {job.budget_min}{job.budget_max ? ` - $${job.budget_max}` : "+"}
                            </span>
                          )}
                          {job.posted_at && (
                            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                              <Clock className="h-3 w-3" />
                              {new Date(job.posted_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {view === "list" && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {job.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                          {job.skills_required?.slice(0, view === "grid" ? 2 : 4).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs font-normal">{skill}</Badge>
                          ))}
                          {(job.skills_required?.length ?? 0) > (view === "grid" ? 2 : 4) && (
                            <Badge variant="outline" className="text-xs font-normal">
                              +{job.skills_required!.length - (view === "grid" ? 2 : 4)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {job.ai_compatibility_score !== null ? (
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant={scoreColor(job.ai_compatibility_score)} className="text-xs whitespace-nowrap">
                              <Brain className="h-3 w-3 mr-1" />
                              {job.ai_compatibility_score} - {scoreLabel(job.ai_compatibility_score)}
                            </Badge>
                            {(job.ai_analysis as any)?.skill_match !== undefined && (
                              <Badge variant="secondary" className="text-xs">
                                Match: {(job.ai_analysis as any).skill_match}%
                              </Badge>
                            )}
                            {job.ai_risk_level && (
                              <Badge variant={
                                job.ai_risk_level === "low" ? "success" :
                                job.ai_risk_level === "medium" ? "warning" : "destructive"
                              } className="text-xs">
                                {t("riskLabel", { risk: job.ai_risk_level })}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={(e) => handleAnalyze(job.id, job.title, job.description, e)}
                            disabled={analyzeJob.isPending}
                          >
                            <Brain className="h-3 w-3 mr-1" />
                            {t("analyze")}
                          </Button>
                        )}
                        <div className="flex gap-1">
                          {job.url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              asChild
                            >
                              <a href={job.url} target="_blank" rel="noopener noreferrer" title={t("openOriginal")}>
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => handleSave(job.id, e)}
                            disabled={saveJob.isPending}
                          >
                            <Bookmark className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
