"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CheckCircle2, Loader2, Mail } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations("auth")
  const registered = searchParams.get("registered")
  const reset = searchParams.get("reset")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState("")
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [confirmDone, setConfirmDone] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setError(t("emailNotConfirmed"))
        } else if (error.message.includes("Invalid login credentials")) {
          setError(t("invalidCredentials"))
        } else {
          setError(error.message)
        }
        setLoading(false)
        return
      }

      if (data.session) {
        await fetch("/api/auth/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
          }),
        })
      }

      router.refresh()
      router.push("/dashboard")
    } catch {
      setError(t("connectionError"))
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || t("resetFailed"))
      } else {
        setResetSent(true)
      }
    } catch {
      toast.error(t("connectionError"))
    } finally {
      setResetLoading(false)
    }
  }

  const handleForceConfirm = async () => {
    setConfirmLoading(true)
    try {
      const res = await fetch("/api/auth/force-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: confirmEmail }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || t("confirmFailed"))
      } else {
        setConfirmDone(true)
        toast.success(t("confirmSuccess"))
      }
    } catch {
      toast.error(t("connectionError"))
    } finally {
      setConfirmLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle>{t("welcomeBack")}</CardTitle>
        <CardDescription>{t("signInSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        {registered === "true" && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950 p-3 text-sm text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {t("accountCreated")}
          </div>
        )}
        {reset === "true" && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-950 p-3 text-sm text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {t("resetSent")}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="text-sm space-y-2">
              <p className="text-destructive">{error}</p>
              {error === t("invalidCredentials") && (
                <div className="flex flex-col gap-1.5">
                  <Dialog open={resetOpen} onOpenChange={setResetOpen}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="text-primary hover:underline text-xs text-left cursor-pointer"
                        onClick={() => { setResetEmail(email); setResetSent(false) }}
                      >
                        {t("forgotPassword")}
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t("resetTitle")}</DialogTitle>
                        <DialogDescription>{t("resetDesc")}</DialogDescription>
                      </DialogHeader>
                      {resetSent ? (
                        <div className="flex flex-col items-center gap-2 py-6 text-center">
                          <Mail className="h-8 w-8 text-primary" />
                          <p className="text-sm text-muted-foreground">{t("resetEmailSent")}</p>
                        </div>
                      ) : (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                          <div className="space-y-2">
                            <Label>{t("email")}</Label>
                            <Input
                              type="email"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full" disabled={resetLoading}>
                            {resetLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("sending")}</> : t("sendReset")}
                          </Button>
                        </form>
                      )}
                    </DialogContent>
                  </Dialog>
                  <button
                    type="button"
                    className="text-primary hover:underline text-xs text-left cursor-pointer"
                    onClick={() => { setConfirmEmail(email); setConfirmDone(false) }}
                  >
                    {t("resendConfirm")}
                  </button>
                </div>
              )}
              {error === t("emailNotConfirmed") && (
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    className="text-primary hover:underline text-xs text-left cursor-pointer"
                    onClick={() => { setConfirmEmail(email); setConfirmDone(false) }}
                  >
                    {t("resendConfirm")}
                  </button>
                </div>
              )}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("signingIn") : t("signInButton")}
          </Button>
        </form>

        {/* Hidden inline confirm dialog */}
        {confirmEmail && (
          <Dialog open={!!confirmEmail && !confirmDone} onOpenChange={(open) => { if (!open) { setConfirmEmail(""); setConfirmDone(false) } }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("confirmTitle")}</DialogTitle>
                <DialogDescription>{t("confirmDesc")}</DialogDescription>
              </DialogHeader>
              {confirmDone ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <p className="text-sm text-muted-foreground">{t("confirmDone")}</p>
                  <Button variant="outline" onClick={() => { setConfirmEmail(""); setConfirmDone(false) }}>
                    {t("tryLogin")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {t("confirmInfo", { email: confirmEmail })}
                  </p>
                  <Button onClick={handleForceConfirm} className="w-full" disabled={confirmLoading}>
                    {confirmLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("confirming")}</> : t("confirmButton")}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t("noAccount")}{" "}
          <Link href="/register" className="text-primary hover:underline">
            {t("registerLink")}
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Suspense fallback={<div className="h-64" />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
