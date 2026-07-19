"use client"

import { useState } from "react"
import { useJobs, useSaveJob, useAnalyzeJob, useTriggerScrape } from "@/hooks/use-jobs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { JobCardSkeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Search, SlidersHorizontal, Brain, Bookmark, RefreshCw,
  DollarSign, Clock, ExternalLink, LayoutGrid, List, Filter,
  ArrowUpDown, ChevronDown
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
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"list" | "grid">("list")
  const [showFilters, setShowFilters] = useState(false)
  const [filter, setFilter] = useState<{ platform?: string; risk?: string }>({})
  const { data: jobs, isLoading, error } = useJobs({ search: search || undefined, ...filter })
  const saveJob = useSaveJob()
  const analyzeJob = useAnalyzeJob()
  const triggerScrape = useTriggerScrape()

  const handleSave = async (jobId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await saveJob.mutateAsync(jobId)
    toast.success("Job saved!")
  }

  const handleAnalyze = async (jobId: string, title: string, description: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await analyzeJob.mutateAsync({ jobId, title, description })
    toast.success("Analysis complete!")
  }

  const handleScrape = async () => {
    await triggerScrape.mutateAsync()
    toast.success("Scraping triggered! Check back soon.")
  }

  const scoreColor = (score: number | null) => {
    if (score === null) return "default"
    if (score >= 70) return "success"
    if (score >= 40) return "warning"
    return "destructive"
  }

  const scoreLabel = (score: number | null) => {
    if (score === null) return "N/A"
    if (score >= 70) return "High Match"
    if (score >= 40) return "Medium"
    return "Low Match"
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
          <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground">AI-curated freelance opportunities from top platforms.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleScrape} disabled={triggerScrape.isPending}>
            <RefreshCw className={`mr-2 h-4 w-4 ${triggerScrape.isPending ? "animate-spin" : ""}`} />
            {triggerScrape.isPending ? "Scraping..." : "Scrape Now"}
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
            placeholder="Search jobs by title..."
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
          Filters
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
            <label className="text-xs font-medium text-muted-foreground">Platform</label>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={filter.platform || ""}
              onChange={(e) => setFilter({ ...filter, platform: e.target.value || undefined })}
            >
              <option value="">All Platforms</option>
              <option value="upwork">Upwork</option>
              <option value="freelancer">Freelancer</option>
              <option value="fiverr">Fiverr</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Risk Level</label>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={filter.risk || ""}
              onChange={(e) => setFilter({ ...filter, risk: e.target.value || undefined })}
            >
              <option value="">All Risk</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="ghost"
              size="sm"
              className="h-9"
              onClick={() => setFilter({})}
            >
              Clear filters
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
          jobs found
        </p>
        <div className="flex items-center gap-1">
          <ArrowUpDown className="h-3 w-3" />
          <span>Newest first</span>
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
            <p className="text-destructive">Failed to load jobs. Make sure you have run the SQL schema in Supabase.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && jobs?.length === 0 && (
        <EmptyState
          icon="search"
          title="No jobs found"
          description={
            search || filter.platform || filter.risk
              ? "Try adjusting your search or filters."
              : "Click 'Scrape Now' to fetch jobs from Upwork and Freelancer.com."
          }
          action={
            search || filter.platform || filter.risk
              ? { label: "Clear Filters", onClick: () => { setSearch(""); setFilter({}) } }
              : { label: "Scrape Now", onClick: handleScrape }
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
                          <Badge variant="secondary" className="text-xs font-normal">{job.platform}</Badge>
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
                            {job.ai_risk_level && (
                              <Badge variant={
                                job.ai_risk_level === "low" ? "success" :
                                job.ai_risk_level === "medium" ? "warning" : "destructive"
                              } className="text-xs">
                                {job.ai_risk_level} risk
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
                            Analyze
                          </Button>
                        )}
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => handleSave(job.id, e)}
                            disabled={saveJob.isPending}
                          >
                            <Bookmark className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              window.open(job.url, "_blank")
                            }}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
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
