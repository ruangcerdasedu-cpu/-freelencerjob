import { test, expect } from "@playwright/test"

test.describe.configure({ timeout: 60000 })

test("mentor page loads with inputs", async ({ page }) => {
  await page.goto("/mentor", { timeout: 60000 })
  await expect(page.locator("h1")).toContainText(/mentor|ai/i)

  const titleInput = page.getByPlaceholder(/e\.g\.,|landing|page/i)
  await expect(titleInput).toBeVisible()

  await expect(page.getByRole("button", { name: /generate|analyze|start/i }).first()).toBeVisible()
})
