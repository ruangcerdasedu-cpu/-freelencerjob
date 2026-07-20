import { test, expect } from "@playwright/test"

test.describe.configure({ timeout: 60000 })

test("settings page loads with profile form", async ({ page }) => {
  await page.goto("/settings", { timeout: 60000 })
  await expect(page.locator("h1")).toContainText(/settings|pengaturan/i)

  const skillsInput = page.getByPlaceholder(/skill/i)
  await expect(skillsInput).toBeVisible()

  const rateInputs = page.locator('input[type="number"]')
  await expect(rateInputs.first()).toBeVisible()

  await expect(page.getByRole("button", { name: /save profile/i })).toBeVisible()
})
