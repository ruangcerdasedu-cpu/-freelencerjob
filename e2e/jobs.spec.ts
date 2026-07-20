import { test, expect } from "@playwright/test"

test.describe.configure({ timeout: 60000 })

test("jobs page loads with filters", async ({ page }) => {
  await page.goto("/jobs", { timeout: 60000 })
  await expect(page.locator("h1")).toContainText(/jobs|pekerjaan/i)

  const searchInput = page.getByPlaceholder(/search/i)
  await expect(searchInput).toBeVisible()

  const filterButton = page.getByRole("button", { name: /filter/i })
  await expect(filterButton).toBeVisible()
})

test("scrape button exists", async ({ page }) => {
  await page.goto("/jobs", { timeout: 60000 })
  const scrapeBtn = page.getByRole("button", { name: /scrape/i })
  await expect(scrapeBtn).toBeVisible()
})
