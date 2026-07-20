import { test, expect } from "@playwright/test"

test.describe.configure({ timeout: 60000 })

test("saved jobs page loads", async ({ page }) => {
  await page.goto("/saved", { timeout: 60000 })
  await expect(page.locator("h1")).toContainText(/saved|tersimpan/i)
  await expect(page.getByText(/no saved jobs/i).first()).toBeVisible()
})
