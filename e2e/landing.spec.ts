import { test, expect } from "@playwright/test"

test.describe.configure({ timeout: 120000 })

test("landing page loads and shows title", async ({ page }) => {
  await page.goto("/", { timeout: 60000 })
  await expect(page.locator("h1")).toBeVisible()
})

test("navigation to login page", async ({ page }) => {
  await page.goto("/", { timeout: 60000 })
  await page.getByRole("link", { name: /sign in|login/i }).first().click()
  await expect(page).toHaveURL(/\/login/)
})

test("navigation to register page", async ({ page }) => {
  await page.goto("/", { timeout: 60000 })
  await page.getByRole("link", { name: /get started|start|register/i }).first().click()
  await expect(page).toHaveURL(/\/register/)
})
