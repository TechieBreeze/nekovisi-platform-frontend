import { defineConfig } from '@playwright/test'

/**
 * Playwright E2E — 跑 frontend `pnpm dev` + backend Docker 起来后的 smoke 10 项。
 * 与 vitest 完全隔离 — 单独用 `pnpm test:e2e` 跑。
 *
 * 依赖:
 *   - frontend `pnpm dev` 已在 :5173 跑通
 *   - backend Spring Boot 已在 :8080 跑通(admin/admin123 可登录)
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  expect: {
    timeout: 5_000,
  },
})
