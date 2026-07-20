import { test, expect } from "@playwright/test"

test.describe.configure({ timeout: 60000 })

test("dashboard loads with all sections", async ({ page }) => {
  await page.goto("/dashboard", { timeout: 60000 })
  await expect(page.locator("h1")).toContainText(/dashboard/i)

  await expect(page.getByText(/jobs available|match score|applied|earned/i).first()).toBeVisible()
  await expect(page.getByText(/funnel|application/i).first()).toBeVisible()
  await expect(page.getByText(/platform|distribution/i).first()).toBeVisible()
  await expect(page.getByText(/weekly|activity/i).first()).toBeVisible()
  await expect(page.getByText(/recent/i).first()).toBeVisible()
})
