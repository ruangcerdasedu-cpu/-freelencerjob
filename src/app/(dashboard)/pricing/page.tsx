"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { usePricing } from "@/hooks/use-jobs"
import { useProfile } from "@/hooks/use-profile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { DollarSign, Loader2, TrendingUp, Lightbulb, AlertTriangle, CheckCircle2 } from "lucide-react"

export default function PricingPage() {
  const t = useTranslations("pricing")
  const { data: profile } = useProfile()
  const pricing = usePricing()

  const [jobTitle, setJobTitle] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [budgetMin, setBudgetMin] = useState("")
  const [budgetMax, setBudgetMax] = useState("")
  const [result, setResult] = useState<any>(null)

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast.error(t("validation"))
      return
    }

    const data = await pricing.mutateAsync({
      jobTitle: jobTitle || undefined,
      jobDescription,
      budgetMin: budgetMin ? Number(budgetMin) : undefined,
      budgetMax: budgetMax ? Number(budgetMax) : undefined,
      userSkills: profile?.skills,
      userRateMin: profile?.hourly_rate_min ?? undefined,
      userRateMax: profile?.hourly_rate_max ?? undefined,
    })

    setResult(data)
    toast.success(t("successToast"))
  }

  const strategyColor = (s: string) => {
    if (s === "premium") return "destructive"
    if (s === "competitive") return "success"
    return "warning"
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Profile Summary */}
      {profile?.skills && profile.skills.length > 0 && (
        <Card className="border-primary/10 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-primary shrink-0" />
            <div className="text-sm">
              <span className="font-medium">{t("yourProfile")}: </span>
              {profile.skills.slice(0, 5).join(", ")}
              {profile.skills.length > 5 && ` +${profile.skills.length - 5} more`}
              {profile.hourly_rate_min && ` · $${profile.hourly_rate_min}/hr${profile.hourly_rate_max ? ` - $${profile.hourly_rate_max}/hr` : ""}`}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("jobDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("jobTitle")}</Label>
            <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder={t("jobTitlePlaceholder")} />
          </div>
          <div className="space-y-2">
            <Label>{t("jobDescription")}</Label>
            <Textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} className="min-h-[150px]" placeholder={t("jobDescPlaceholder")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("budgetMin")}</Label>
              <Input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="$500" />
            </div>
            <div className="space-y-2">
              <Label>{t("budgetMax")}</Label>
              <Input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="$2000" />
            </div>
          </div>
          <Button onClick={handleAnalyze} disabled={pricing.isPending}>
            {pricing.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("analyzing")}</>
            ) : (
              <><TrendingUp className="mr-2 h-4 w-4" /> {t("analyzePricing")}</>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Rate Suggestion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                {t("suggestedRate")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-bold">${result.suggested_rate_min}</span>
                {result.suggested_rate_max && result.suggested_rate_max !== result.suggested_rate_min && (
                  <>
                    <span className="text-2xl text-muted-foreground">-</span>
                    <span className="text-3xl font-bold">${result.suggested_rate_max}</span>
                  </>
                )}
                <span className="text-sm text-muted-foreground">/hr</span>
                <Badge variant={strategyColor(result.pricing_strategy)} className="ml-auto">
                  {result.pricing_strategy}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">{t("marketAverage")}</p>
                  <p className="text-lg font-semibold">${result.market_average}/hr</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">{t("skillValue")}</p>
                  <p className="text-lg font-semibold">{result.your_skill_value}%</p>
                </div>
              </div>

              {result.is_competitive !== undefined && (
                <div className={`flex items-center gap-2 mt-4 text-sm ${result.is_competitive ? "text-emerald-600" : "text-amber-600"}`}>
                  {result.is_competitive ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  {result.is_competitive ? t("competitive") : t("notCompetitive")}
                </div>
              )}

              <p className="text-sm text-muted-foreground mt-4">{result.reasoning}</p>
            </CardContent>
          </Card>

          {/* Negotiation Tips */}
          {result.negotiation_tips?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  {t("negotiationTips")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.negotiation_tips.map((tip: string, i: number) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="text-primary font-medium shrink-0">{i + 1}.</span>
                      <span className="text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Red Flags */}
          {result.red_flags?.length > 0 && (
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  {t("redFlags")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {result.red_flags.map((flag: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
