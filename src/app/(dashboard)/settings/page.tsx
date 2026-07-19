"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useUser } from "@/hooks/use-user"
import { useProfile, useUpdateProfile } from "@/hooks/use-profile"

const SKILL_SUGGESTIONS = [
  "React", "Next.js", "TypeScript", "JavaScript", "Node.js", "Python", "PHP", "Laravel",
  "WordPress", "UI/UX Design", "Figma", "Tailwind CSS", "Vue.js", "Angular", "SQL",
  "MongoDB", "PostgreSQL", "GraphQL", "REST API", "Docker", "AWS", "Firebase",
  "SEO", "Content Writing", "Copywriting", "Digital Marketing", "Social Media",
  "Data Entry", "Excel", "Web Scraping", "Mobile Development", "Flutter", "React Native",
]

export default function SettingsPage() {
  const t = useTranslations("settings")
  const { user } = useUser()
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()

  const [fullName, setFullName] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const [hourlyRateMin, setHourlyRateMin] = useState("")
  const [hourlyRateMax, setHourlyRateMax] = useState("")
  const [experience, setExperience] = useState("")

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "")
      setSkills(profile.skills || [])
      setHourlyRateMin(profile.hourly_rate_min?.toString() || "")
      setHourlyRateMax(profile.hourly_rate_max?.toString() || "")
    }
  }, [profile])

  const addSkill = (skill: string) => {
    const s = skill.trim()
    if (s && !skills.includes(s)) {
      setSkills([...skills, s])
    }
    setSkillInput("")
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  const filteredSuggestions = SKILL_SUGGESTIONS.filter(
    (s) => s.toLowerCase().includes(skillInput.toLowerCase()) && !skills.includes(s)
  )

  const handleSave = async () => {
    await updateProfile.mutateAsync({
      full_name: fullName,
      skills,
      hourly_rate_min: hourlyRateMin ? parseInt(hourlyRateMin) : null,
      hourly_rate_max: hourlyRateMax ? parseInt(hourlyRateMax) : null,
    })
    toast.success(t("savedToast"))
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Card><CardContent className="py-8 text-center text-muted-foreground">Loading...</CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("profile")}</CardTitle>
          <CardDescription>{t("profileDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("fullName")}</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label>{t("email")}</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>{t("skills")}</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                  {skill} ✕
                </Badge>
              ))}
            </div>
            <div className="relative">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput) }
                }}
                placeholder={t("skillsPlaceholder")}
              />
              {skillInput && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 top-full mt-1 w-full rounded-md border bg-background shadow-md">
                  {filteredSuggestions.slice(0, 5).map((s) => (
                    <button
                      key={s}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                      onClick={() => addSkill(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("hourlyRateMin")}</Label>
              <Input type="number" value={hourlyRateMin} onChange={(e) => setHourlyRateMin(e.target.value)} placeholder="$20" />
            </div>
            <div className="space-y-2">
              <Label>{t("hourlyRateMax")}</Label>
              <Input type="number" value={hourlyRateMax} onChange={(e) => setHourlyRateMax(e.target.value)} placeholder="$50" />
            </div>
          </div>
          <Button onClick={handleSave} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? t("saving") : t("saveProfile")}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>{t("apiKeys")}</CardTitle>
          <CardDescription>{t("apiKeysDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groq">{t("groqKey")}</Label>
            <Input id="groq" type="password" placeholder={t("groqPlaceholder")} />
          </div>
          <Button>{t("saveApiKey")}</Button>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>{t("scraperSettings")}</CardTitle>
          <CardDescription>{t("scraperDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apify">{t("apifyToken")}</Label>
            <Input id="apify" type="password" placeholder={t("apifyPlaceholder")} />
          </div>
          <Button>{t("saveToken")}</Button>
        </CardContent>
      </Card>
    </div>
  )
}
