import { test as setup, expect } from "@playwright/test"
import { existsSync, mkdirSync, writeFileSync } from "fs"

const TEST_EMAIL = `test-e2e-${Date.now()}@example.com`
const TEST_PASSWORD = "TestPass123!"
const TEST_NAME = "E2E Test User"

setup("register and login as test user", async ({ page }) => {
  setup.setTimeout(300000)

  const gotoOpts = { waitUntil: "domcontentloaded" as const, timeout: 180000 }
  const clickWaitOpts = { timeout: 180000 }

  await page.goto("/register", gotoOpts)
  await page.waitForTimeout(5000)

  await page.fill("#fullName", TEST_NAME)
  await page.fill("#email", TEST_EMAIL)
  await page.fill("#password", TEST_PASSWORD)

  await page.click('button[type="submit"]')
  await page.waitForURL("**/login?registered=true", clickWaitOpts)
  await page.waitForTimeout(2000)

  await page.fill("#email", TEST_EMAIL)
  await page.fill("#password", TEST_PASSWORD)

  await page.click('button[type="submit"]')
  await page.waitForURL("**/dashboard", clickWaitOpts)

  const dir = "e2e/.auth"
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  await page.context().storageState({ path: `${dir}/user.json` })

  writeFileSync(`${dir}/.env`, JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }), "utf-8")
})
