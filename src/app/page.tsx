import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Bot, Briefcase, MessageSquare, BarChart3, Sparkles, CheckCircle2, Star } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <span className="text-lg font-bold tracking-tight">FreelencerJob</span>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Button>
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
              AI-Powered Freelance Platform
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl max-w-4xl mx-auto leading-tight">
              Your AI-Powered{" "}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Freelance Productivity
              </span>{" "}
              Engine
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Smart job aggregation, AI project mentoring, and professional communication assistance
              designed for freelance professionals who want to work smarter, not harder.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 text-base">
                  Start Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                  Sign In
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Free AI analysis
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Cancel anytime
              </span>
            </div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Everything You Need to Succeed</h2>
              <p className="mt-3 text-muted-foreground">
                One platform to find, manage, and win freelance projects.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Briefcase,
                  title: "Smart Job Aggregator",
                  description: "AI-curated jobs from Upwork, Freelancer, and Fiverr matched to your skills and preferences.",
                  features: ["Real-time scraping", "AI compatibility scoring", "Smart filtering"],
                  gradient: "from-indigo-500/10 to-purple-500/10",
                },
                {
                  icon: Bot,
                  title: "AI Project Mentor",
                  description: "Break down complex projects into actionable micro-tasks with step-by-step technical guides.",
                  features: ["Task breakdown", "Technical guides", "Draft validation"],
                  gradient: "from-purple-500/10 to-pink-500/10",
                },
                {
                  icon: MessageSquare,
                  title: "Communication Assistant",
                  description: "Professional message drafts, tone analysis, and negotiation simulation for international clients.",
                  features: ["Proposal drafts", "Tone analysis", "Negotiation sim"],
                  gradient: "from-blue-500/10 to-cyan-500/10",
                },
                {
                  icon: BarChart3,
                  title: "Personal Dashboard",
                  description: "Visual pipeline tracking from applied to paid, with earnings analytics and activity monitoring.",
                  features: ["Funnel visualization", "Earnings tracking", "Activity timeline"],
                  gradient: "from-emerald-500/10 to-teal-500/10",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className={`group relative rounded-xl border bg-card p-6 transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] dark:hover:shadow-[var(--shadow-card-hover-dark)]`}
                >
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
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
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl mb-4">
              Built for Freelancers, Powered by AI
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
              Our technology stack ensures you get the best opportunities with intelligent assistance every step of the way.
            </p>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                { stat: "50+", label: "Jobs Scraped Daily", desc: "From top freelance platforms" },
                { stat: "5s", label: "AI Analysis Speed", desc: "Fast job compatibility scoring" },
                { stat: "100%", label: "Free to Start", desc: "No hidden fees or subscriptions" },
              ].map((item) => (
                <div key={item.stat}>
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
          <span className="text-sm font-bold">&copy; {new Date().getFullYear()} FreelencerJob</span>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
