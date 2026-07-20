"use client"

import { useJobs, useUserJobs } from "@/hooks/use-jobs"
import { useProfile } from "@/hooks/use-profile"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StatsCardSkeleton, ChartSkeleton } from "@/components/ui/skeleton"
import { Briefcase, Eye, Clock, DollarSign, TrendingUp, TrendingDown, ArrowRight, Brain, Target } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area
} from "recharts"

const funnelColors = {
  saved: "#6366f1",
  applied: "#8b5cf6",
  interview: "#a855f7",
  in_progress: "#3b82f6",
  completed: "#22c55e",
  paid: "#16a34a",
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function DashboardPage() {
  const t = useTranslations("dashboard")
  const c = useTranslations("common")
  const { data: jobs, isLoading: jobsLoading } = useJobs()
  const { data: userJobs, isLoading: userJobsLoading } = useUserJobs()
  const { data: profile } = useProfile()

  const isLoading = jobsLoading || userJobsLoading

  const now = new Date()
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000)

  const jobsThisWeek = jobs?.filter((j) => new Date(j.created_at) >= daysAgo(7)).length ?? 0
  const jobsLastWeek = jobs?.filter((j) => {
    const d = new Date(j.created_at)
    return d >= daysAgo(14) && d < daysAgo(7)
  }).length ?? 0
  const jobsTrend = jobsLastWeek > 0 ? `+${Math.round(((jobsThisWeek - jobsLastWeek) / jobsLastWeek) * 100)}%` : jobsThisWeek > 0 ? "+100%" : "0"
  const jobsTrendUp = jobsThisWeek >= jobsLastWeek

  const userSkills = profile?.skills ?? []
  const matchCount = jobs?.filter((j) => {
    if (!userSkills.length || !j.skills_required?.length) return false
    return j.skills_required.some((s: string) => userSkills.some((us: string) => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase())))
  }).length ?? 0
  const matchPercent = jobs?.length ? Math.round((matchCount / jobs.length) * 100) : 0

  const paidCount = userJobs?.filter((j) => j.status === "paid").length ?? 0
  const appliedCount = userJobs?.filter((j) => j.status === "applied").length ?? 0
  const appliedThisWeek = userJobs?.filter((j) => new Date(j.created_at) >= daysAgo(7)).length ?? 0
  const appliedLastWeek = userJobs?.filter((j) => {
    const d = new Date(j.created_at)
    return d >= daysAgo(14) && d < daysAgo(7)
  }).length ?? 0
  const appliedTrend = appliedLastWeek > 0 ? `+${Math.round(((appliedThisWeek - appliedLastWeek) / appliedLastWeek) * 100)}%` : appliedThisWeek > 0 ? "+100%" : "0"
  const appliedTrendUp = appliedThisWeek >= appliedLastWeek

  const stats = [
    {
      label: t("jobsAvailable"),
      value: jobs?.length ?? 0,
      icon: Briefcase,
      trend: jobsTrend,
      trendUp: jobsTrendUp,
    },
    {
      label: t("matchCard"),
      value: `${matchPercent}%`,
      icon: Target,
      trend: `${matchCount}`,
      trendUp: true,
    },
    {
      label: t("applied"),
      value: appliedCount,
      icon: Eye,
      trend: appliedTrend,
      trendUp: appliedTrendUp,
    },
    {
      label: t("earned"),
      value: `$${paidCount * 100}`,
      icon: DollarSign,
      trend: `$${paidCount * 100}`,
      trendUp: true,
    },
  ]

  const funnelData = [
    { name: "Saved", value: userJobs?.filter((j) => j.status === "saved").length ?? 0, color: funnelColors.saved },
    { name: "Applied", value: userJobs?.filter((j) => j.status === "applied").length ?? 0, color: funnelColors.applied },
    { name: "Interview", value: userJobs?.filter((j) => j.status === "interview").length ?? 0, color: funnelColors.interview },
    { name: "In Progress", value: userJobs?.filter((j) => j.status === "in_progress").length ?? 0, color: funnelColors.in_progress },
    { name: "Completed", value: userJobs?.filter((j) => j.status === "completed").length ?? 0, color: funnelColors.completed },
    { name: "Paid", value: userJobs?.filter((j) => j.status === "paid").length ?? 0, color: funnelColors.paid },
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const weeklyData = dayNames.map((day) => {
    const dayIndex = dayNames.indexOf(day)
    const jobsOnDay = jobs?.filter((j) => {
      const d = new Date(j.created_at)
      return d >= daysAgo((6 - dayIndex) + 7) && d < daysAgo(6 - dayIndex)
    }).length ?? 0
    const appliedOnDay = userJobs?.filter((j) => {
      const d = new Date(j.created_at)
      return d >= daysAgo((6 - dayIndex) + 7) && d < daysAgo(6 - dayIndex)
    }).length ?? 0
    return { day, jobs: jobsOnDay, applied: appliedOnDay }
  })

  const recentJobs = jobs?.slice(0, 5) ?? []

  const platformData = [
    { name: "Upwork", value: jobs?.filter((j) => j.platform === "upwork").length ?? 0, color: "#14a800" },
    { name: "Freelancer", value: jobs?.filter((j) => j.platform === "freelancer").length ?? 0, color: "#0078d4" },
    { name: "Fiverr", value: jobs?.filter((j) => j.platform === "fiverr").length ?? 0, color: "#1dbf73" },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </motion.div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={item}>
              <Card className="transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] dark:hover:shadow-[var(--shadow-card-hover-dark)]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    {stat.trend && (
                      <span
                        className={`flex items-center text-xs font-medium ${
                          stat.trendUp ? "text-green-600 dark:text-green-400" : "text-destructive"
                        }`}
                      >
                        {stat.trendUp ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                        {stat.trend}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {userSkills.length > 0 && (
        <motion.div variants={container} initial="hidden" animate="show">
          <Card className="border-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                {t("skillMatchTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{t("skillMatchDesc", { count: matchCount, total: jobs?.length ?? 0 })}</span>
                <span className="text-lg font-bold">{matchPercent}%</span>
              </div>
              <Progress value={matchPercent} className="h-2" />
              <div className="flex flex-wrap gap-1.5 mt-3">
                {userSkills.slice(0, 6).map((skill: string) => {
                  const hasMatch = jobs?.some((j) =>
                    j.skills_required?.some((s: string) =>
                      s.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(s.toLowerCase())
                    )
                  )
                  return (
                    <Badge key={skill} variant={hasMatch ? "success" : "secondary"} className="text-xs">
                      {skill}
                    </Badge>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 lg:grid-cols-2"
      >
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{t("funnelTitle")}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {userJobs?.length ?? 0} total
              </Badge>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ChartSkeleton />
              ) : funnelData.every((d) => d.value === 0) ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("funnelEmpty")}
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/jobs">{t("funnelAction")}</Link>
                  </Button>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelData} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          background: "var(--popover)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                        {funnelData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{t("platformTitle")}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {jobs?.length ?? 0} jobs
              </Badge>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ChartSkeleton />
              ) : platformData.every((d) => d.value === 0) ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("platformEmpty")}
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/jobs">{t("platformAction")}</Link>
                  </Button>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={platformData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {platformData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "var(--popover)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                    {platformData.map((p) => (
                      <div key={p.name} className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                        {p.name} ({p.value})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{t("weeklyTitle")}</CardTitle>
              <Badge variant="secondary" className="text-xs">{t("weeklyBadge")}</Badge>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="jobs"
                      stroke="var(--color-primary)"
                      fill="var(--color-primary)"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="applied"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{t("recentTitle")}</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs" asChild>
                <Link href="/jobs">
                  {c("viewAll")} <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-1">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-12 animate-skeleton rounded-md bg-muted" />
                  ))}
                </div>
              ) : recentJobs.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t("recentEmpty")}
                  </p>
                </div>
              ) : (
                recentJobs.map((job, i) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary shrink-0">
                        {i + 1}
                      </span>
                      <span className="truncate font-medium">{job.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          job.locale === "DN" ? "border-emerald-300 text-emerald-700 dark:text-emerald-400 dark:border-emerald-700" : "border-blue-300 text-blue-700 dark:text-blue-400 dark:border-blue-700"
                        }`}
                      >
                        {job.locale === "DN" ? "DN" : "LN"}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {job.platform}
                      </Badge>
                      {job.ai_compatibility_score && (
                        <span className="text-xs text-muted-foreground">{job.ai_compatibility_score}</span>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
