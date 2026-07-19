"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Bot, Briefcase, MessageSquare, BarChart3, Sparkles, CheckCircle2 } from "lucide-react"

export default function Home() {
  const t = useTranslations("landing")
  const c = useTranslations("common")

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <span className="text-lg font-bold tracking-tight">{c("appName")}</span>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">{c("signIn")}</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">{c("getStarted")} <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden py-20 lg:py-28">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
          <div className="relative mx-auto max-w-7xl px-6 text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
              {t("badge")}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl max-w-4xl mx-auto leading-tight">
              {t("heroHeading1")}{" "}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {t("heroHeadingGradient")}
              </span>{" "}
              {t("heroHeading2")}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("heroDesc")}
            </p>
            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 text-base">
                  {c("startFree")} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                  {c("signIn")}
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {t("heroNoCredit")}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {t("heroFreeAI")}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {t("heroCancel")}
              </span>
            </div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("featuresTitle")}</h2>
              <p className="mt-3 text-muted-foreground">{t("featuresSubtitle")}</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Briefcase,
                  titleKey: "feature1Title",
                  descKey: "feature1Desc",
                  features: [t("feature1Tag1"), t("feature1Tag2"), t("feature1Tag3")],
                  gradient: "from-indigo-500/10 to-purple-500/10",
                },
                {
                  icon: Bot,
                  titleKey: "feature2Title",
                  descKey: "feature2Desc",
                  features: [t("feature2Tag1"), t("feature2Tag2"), t("feature2Tag3")],
                  gradient: "from-purple-500/10 to-pink-500/10",
                },
                {
                  icon: MessageSquare,
                  titleKey: "feature3Title",
                  descKey: "feature3Desc",
                  features: [t("feature3Tag1"), t("feature3Tag2"), t("feature3Tag3")],
                  gradient: "from-blue-500/10 to-cyan-500/10",
                },
                {
                  icon: BarChart3,
                  titleKey: "feature4Title",
                  descKey: "feature4Desc",
                  features: [t("feature4Tag1"), t("feature4Tag2"), t("feature4Tag3")],
                  gradient: "from-emerald-500/10 to-teal-500/10",
                },
              ].map((feature) => (
                <div
                  key={feature.titleKey}
                  className="group relative rounded-xl border bg-card p-6 transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] dark:hover:shadow-[var(--shadow-card-hover-dark)]"
                >
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{t(feature.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t(feature.descKey)}</p>
                    <ul className="space-y-1.5">
                      {feature.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-muted/30">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl mb-4">{t("ctaTitle")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-12">{t("ctaDesc")}</p>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                { stat: t("stat1Value"), label: t("stat1Label"), desc: t("stat1Sub") },
                { stat: t("stat2Value"), label: t("stat2Label"), desc: t("stat2Sub") },
                { stat: t("stat3Value"), label: t("stat3Label"), desc: t("stat3Sub") },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-4xl font-bold text-primary mb-2">{item.stat}</div>
                  <div className="font-semibold">{item.label}</div>
                  <div className="text-sm text-muted-foreground">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-6">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-sm font-bold">
            &copy; {t("footerCopyright", { year: new Date().getFullYear() })}
          </span>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">{c("signIn")}</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">{c("getStarted")}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
