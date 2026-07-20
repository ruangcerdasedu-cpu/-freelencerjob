"use client"

import { createClient } from "@/lib/supabase/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CommunicationDraft } from "@/types/database"

export function useDrafts(type?: string) {
  return useQuery({
    queryKey: ["drafts", type],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (type) params.set("type", type)
      const res = await fetch(`/api/drafts?${params}`)
      if (!res.ok) throw new Error("Failed to fetch drafts")
      return res.json() as Promise<CommunicationDraft[]>
    },
  })
}

export function useSaveDraft() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      jobId?: string
      type?: string
      draft_content: string
      tone?: string
      context?: string
      language?: string
    }) => {
      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to save draft")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drafts"] })
    },
  })
}

export function useDeleteDraft() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/drafts?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete draft")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drafts"] })
    },
  })
}
