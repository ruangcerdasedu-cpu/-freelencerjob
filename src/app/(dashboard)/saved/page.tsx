"use client"

import { useUserJobs, useUpdateJobStatus } from "@/hooks/use-jobs"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { motion } from "framer-motion"
import { useSortable } from "@dnd-kit/sortable"
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { Brain, MessageSquare, DollarSign, ExternalLink, ChevronRight } from "lucide-react"
import Link from "next/link"

const columns = [
  { key: "saved" as const, label: "Saved", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
  { key: "applied" as const, label: "Applied", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  { key: "interview" as const, label: "Interview", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  { key: "in_progress" as const, label: "In Progress", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { key: "completed" as const, label: "Completed", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
  { key: "paid" as const, label: "Paid", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
]

const statusColors: Record<string, string> = {
  saved: "bg-indigo-500",
  applied: "bg-violet-500",
  interview: "bg-purple-500",
  in_progress: "bg-blue-500",
  completed: "bg-green-500",
  paid: "bg-emerald-500",
}

function KanbanCard({ userJob, columnKey }: { userJob: any; columnKey: string }) {
  const updateStatus = useUpdateJobStatus()

  const nextStatuses = columns
    .map((c) => c.key)
    .filter((k) => k !== columnKey)

  return (
    <Card className="text-sm shadow-sm">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-1">
          <p className="font-medium text-xs line-clamp-2 flex-1">{userJob.job?.title}</p>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 shrink-0"
            asChild
          >
            <Link href={`/jobs/${userJob.job_id}`}>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{userJob.job?.platform}</Badge>
          {userJob.job?.budget_min && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <DollarSign className="h-2.5 w-2.5" />
              ${userJob.job.budget_min}
            </span>
          )}
        </div>
        <div className="flex gap-1 pt-1 border-t">
          {nextStatuses.slice(0, 3).map((status) => {
            const col = columns.find((c) => c.key === status)
            return (
              <Button
                key={status}
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] px-1.5 hover:bg-accent"
                onClick={() => updateStatus.mutate({ userJobId: userJob.id, status })}
                disabled={updateStatus.isPending}
              >
                {col?.label}
                <ChevronRight className="h-2.5 w-2.5 ml-0.5" />
              </Button>
            )
          })}
        </div>
        <div className="flex gap-1 pt-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
            <Link href={`/mentor?jobId=${userJob.job_id}`}>
              <Brain className="h-3 w-3" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
            <Link href={`/communicate?jobId=${userJob.job_id}`}>
              <MessageSquare className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SavedPage() {
  const t = useTranslations("saved")
  const { data: userJobs, isLoading } = useUserJobs()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-16" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </motion.div>

      {!userJobs || userJobs.length === 0 ? (
        <EmptyState
          icon="saved"
          title={t("emptyTitle")}
          description={t("emptyDesc")}
          action={{ label: t("browseJobs"), href: "/jobs" }}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        >
          {columns.map((column) => {
            const items = userJobs.filter((uj) => uj.status === column.key)
            return (
              <motion.div
                key={column.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: columns.indexOf(column) * 0.05 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${statusColors[column.key]}`} />
                    <h3 className="text-sm font-semibold">{column.label}</h3>
                  </div>
                  <Badge variant="secondary" className="text-xs h-5 px-2">{items.length}</Badge>
                </div>
                <div className="space-y-2 min-h-[120px]">
                  {items.map((uj) => (
                    <motion.div
                      key={uj.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <KanbanCard userJob={uj} columnKey={column.key} />
                    </motion.div>
                  ))}
                  {items.length === 0 && (
                    <div className="rounded-lg border-2 border-dashed p-4 text-center">
                      <p className="text-xs text-muted-foreground">{t("dropHere")}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
