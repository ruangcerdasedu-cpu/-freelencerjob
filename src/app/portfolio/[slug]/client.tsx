"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, Globe, DollarSign, ExternalLink, Briefcase, CheckCircle2, Clock } from "lucide-react"

interface Project {
  id: string
  title: string
  description: string
  platform: string
  budget_min: number | null
  budget_max: number | null
  currency: string
  skills_required: string[]
  client_country: string | null
  status: string
  url: string | null
  applied_at: string | null
  created_at: string
}

interface Profile {
  full_name: string | null
  avatar_url: string | null
  skills: string[]
  hourly_rate_min: number | null
  hourly_rate_max: number | null
  timezone: string
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function platformColor(platform: string) {
  switch (platform) {
    case "upwork": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
    case "freelancer": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
    case "fiverr": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100"
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
  }
}

export default function PortfolioClient({ profile, projects }: { profile: Profile; projects: Project[] }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <span className="text-sm font-semibold tracking-tight">FreelencerJob</span>
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Built with FreelencerJob
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b bg-card">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <Avatar className="mx-auto mb-4 h-20 w-20 ring-4 ring-background">
            <AvatarFallback className="text-lg bg-primary text-primary-foreground">
              {profile.full_name ? getInitials(profile.full_name) : "?"}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold tracking-tight">
            {profile.full_name || "Anonymous Freelancer"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Freelance portfolio showcasing completed projects and professional experience.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {profile.timezone && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Globe className="h-3 w-3" />
                {profile.timezone}
              </span>
            )}
            {(profile.hourly_rate_min || profile.hourly_rate_max) && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                ${profile.hourly_rate_min || 0}/hr{profile.hourly_rate_max ? ` - $${profile.hourly_rate_max}/hr` : ""}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Briefcase className="h-3 w-3" />
              {projects.length} project{projects.length !== 1 ? "s" : ""} completed
            </span>
          </div>
          {profile.skills.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {profile.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Projects */}
      <section className="mx-auto max-w-4xl px-4 py-8">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          Portfolio Projects
        </h2>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No portfolio projects yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <Card key={project.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2">
                      {project.title}
                    </h3>
                    <Badge className={platformColor(project.platform)}>
                      {project.platform}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                    {project.description}
                  </p>
                  {project.skills_required.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.skills_required.slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-[10px]">
                          {skill}
                        </Badge>
                      ))}
                      {project.skills_required.length > 4 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{project.skills_required.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      {(project.budget_min || project.budget_max) && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {project.budget_min ? `$${project.budget_min}` : ""}
                          {project.budget_min && project.budget_max ? " - " : ""}
                          {project.budget_max ? `$${project.budget_max}` : ""}
                        </span>
                      )}
                      {project.client_country && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {project.client_country}
                        </span>
                      )}
                    </div>
                    <Badge variant={project.status === "paid" ? "success" : "secondary"} className="text-[10px]">
                      {project.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t mt-8">
        <div className="mx-auto max-w-4xl px-4 py-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Powered by FreelencerJob — AI-powered freelance productivity platform
          </Link>
        </div>
      </footer>
    </div>
  )
}
