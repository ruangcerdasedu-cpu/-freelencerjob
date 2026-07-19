import { createClient } from "@/lib/supabase/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Job, UserJob } from "@/types/database"

function getClient() {
  return createClient()
}

export function useJobs(filters?: {
  platform?: string
  riskLevel?: string
  minScore?: number
  search?: string
}) {
  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: async () => {
      const supabase = getClient()
      let query = supabase
        .from("jobs")
        .select("*")
        .order("scraped_at", { ascending: false })
        .limit(50)

      if (filters?.platform) {
        query = query.eq("platform", filters.platform)
      }
      if (filters?.riskLevel) {
        query = query.eq("ai_risk_level", filters.riskLevel)
      }
      if (filters?.minScore !== undefined) {
        query = query.gte("ai_compatibility_score", filters.minScore)
      }
      if (filters?.search) {
        query = query.ilike("title", `%${filters.search}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Job[]
    },
  })
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const supabase = getClient()
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single()

      if (error) throw error
      return data as Job
    },
    enabled: !!id,
  })
}

export function useUserJobs(status?: string) {
  return useQuery({
    queryKey: ["user-jobs", status],
    queryFn: async () => {
      const supabase = getClient()
      let query = supabase
        .from("user_jobs")
        .select("*, job:jobs(*)")
        .order("created_at", { ascending: false })

      if (status) {
        query = query.eq("status", status)
      }

      const { data, error } = await query
      if (error) throw error
      return data as (UserJob & { job: Job })[]
    },
  })
}

export function useSaveJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (jobId: string) => {
      const supabase = getClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("user_jobs").upsert(
        { user_id: user.id, job_id: jobId, status: "saved" },
        { onConflict: "user_id, job_id" }
      )

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-jobs"] })
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
    },
  })
}

export function useUpdateJobStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userJobId, status }: { userJobId: string; status: UserJob["status"] }) => {
      const supabase = getClient()
      const { error } = await supabase
        .from("user_jobs")
        .update({
          status,
          applied_at: status === "applied" ? new Date().toISOString() : undefined,
        })
        .eq("id", userJobId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-jobs"] })
    },
  })
}

export function useAnalyzeJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ jobId, title, description }: { jobId: string; title: string; description: string }) => {
      const response = await fetch("/api/ai/analyze-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, title, description }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Analysis failed")
      }

      return response.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["job", variables.jobId] })
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
    },
  })
}

export function useGenerateMentorTasks() {
  return useMutation({
    mutationFn: async ({ jobTitle, jobDescription }: { jobTitle: string; jobDescription: string }) => {
      const response = await fetch("/api/ai/mentor-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, jobDescription }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Task generation failed")
      }

      return response.json()
    },
  })
}

export function useGenerateDraft() {
  return useMutation({
    mutationFn: async (params: {
      draftType: string
      jobTitle: string
      clientMessage?: string
      context?: string
    }) => {
      const response = await fetch("/api/ai/communication-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Draft generation failed")
      }

      return response.json()
    },
  })
}

export function useTriggerScrape() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/scraper/trigger", { method: "POST" })
      if (!response.ok) throw new Error("Scrape trigger failed")
      return response.json()
    },
  })
}
