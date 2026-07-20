import { test, expect } from "@playwright/test"

test.describe.configure({ timeout: 60000 })

test("communicate page loads with form and templates", async ({ page }) => {
  await page.goto("/communicate", { timeout: 60000 })
  await expect(page.locator("h1")).toContainText(/communication|assistant/i)

  await expect(page.getByRole("button", { name: /saved templates/i })).toBeVisible()

  const input = page.getByPlaceholder(/paste|job description|url/i)
  await expect(input).toBeVisible()

  await expect(page.getByRole("button", { name: /generate draft/i })).toBeVisible()
})
