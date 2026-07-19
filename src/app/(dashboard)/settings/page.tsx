"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useUser } from "@/hooks/use-user"

export default function SettingsPage() {
  const t = useTranslations("settings")
  const { user } = useUser()

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
            <Label>{t("email")}</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
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
