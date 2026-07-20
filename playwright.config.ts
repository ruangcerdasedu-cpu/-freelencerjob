import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "setup",
      testMatch: "global-setup.ts",
    },
    {
      name: "chromium",
      dependencies: ["setup"],
      use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/user.json", navigationTimeout: 120000, actionTimeout: 60000 },
    },
  ],
  webServer: {
    command: "node node_modules/next/dist/bin/next dev -p 3000",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 300000,
  },
})
