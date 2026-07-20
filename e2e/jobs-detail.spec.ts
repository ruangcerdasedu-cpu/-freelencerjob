import { test, expect } from "@playwright/test"

test.describe.configure({ timeout: 60000 })

test("job detail page loads when navigating from jobs list", async ({ page }) => {
  await page.goto("/jobs", { timeout: 60000 })
  await page.waitForTimeout(2000)
  const jobLink = page.locator("a[href*='/jobs/']").first()
  if (await jobLink.isVisible()) {
    await jobLink.click()
    await page.waitForURL(/\/jobs\//, { timeout: 30000 })
    await expect(page.locator("h1")).toBeVisible()
  }
})
