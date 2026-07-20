import { test, expect } from "@playwright/test"

test.describe.configure({ timeout: 120000 })

test("pricing page loads with form", async ({ page }) => {
  await page.goto("/pricing", { timeout: 60000 })
  await expect(page.locator("h1")).toContainText(/pricing|calculator/i)

  const textarea = page.getByPlaceholder(/paste|description/i)
  await expect(textarea).toBeVisible()

  await expect(page.getByRole("button", { name: /analyze/i })).toBeVisible()
})

test("analyze pricing with job description", async ({ page }) => {
  await page.goto("/pricing", { timeout: 60000 })
  await page.fill("textarea", "I need a WordPress website with e-commerce functionality, payment gateway integration, and responsive design.")
  await page.getByRole("button", { name: /analyze/i }).click()
  await page.waitForResponse((resp) => resp.url().includes("/api/ai/pricing"), { timeout: 60000 })
  await expect(page.getByText(/suggested rate|rate yang/i).first()).toBeVisible({ timeout: 30000 })
})
