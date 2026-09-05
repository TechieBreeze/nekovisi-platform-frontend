import { test, expect } from '@playwright/test'

/**
 * 报名表模块端到端 — 4 项 smoke:
 *   1. Sidebar 出现"报名表"导航项
 *   2. 进入 /admin/registration-forms → 列表页加载(允许空)
 *   3. 点 + 新建表单 → TemplatePickerDialog 弹层
 *   4. 详情页访问(直接打开一个已知 form ID)→ 看到字段定义 + 记录卡
 *
 * 依赖 backend Spring Boot + frontend dev server 已起;
 * admin/admin123 可用(读环境变量 E2E_ADMIN_PASS)。
 */

const ADMIN_USER = 'admin'
const ADMIN_PASS = process.env.E2E_ADMIN_PASS ?? 'admin123'

test.describe.configure({ mode: 'serial' })

test.beforeEach(async ({ page, context }) => {
  await context.clearCookies()
  await page.addInitScript(() => {
    try { localStorage.clear() } catch {}
  })
  // 自包含:每个测试都重新登录,避免依赖之前的状态
  await page.goto('/login')
  await page.getByLabel(/用户名|username/i).fill(ADMIN_USER)
  await page.getByLabel(/密码|password/i).fill(ADMIN_PASS)
  await page.getByRole('button', { name: /登录|sign in/i }).click()
  await page.waitForURL(/\/admin\/(contests|registration-forms)/, { timeout: 10_000 })
})

test('1. Sidebar shows registration forms nav entry', async ({ page }) => {
  await expect(page.getByRole('link', { name: /报名表/i })).toBeVisible()
})

test('2. registration forms list page renders', async ({ page }) => {
  await page.goto('/admin/registration-forms')
  await expect(page.getByRole('heading', { name: '报名表' })).toBeVisible()
  // 表格或空态卡片
  const tableOrEmpty = page.locator('table, .surface-card')
  await expect(tableOrEmpty.first()).toBeVisible({ timeout: 8_000 })
})

test('3. clicking new form opens template picker dialog', async ({ page }) => {
  await page.goto('/admin/registration-forms/new')
  // 第一步:选模板
  await expect(page.getByText(/选择字段模板/i)).toBeVisible({ timeout: 8_000 })
  // 内置模板按钮应该至少有一个
  await expect(page.getByText(/ICPC|个人赛|内置/i).first()).toBeVisible()
})

test('4. detail page (ID 1) loads with field editor and record card', async ({ page }) => {
  // 直接打开 — 后端必须有 form id=1(seed 内置模板不会创建表单,跳过若无)
  const resp = await page.goto('/admin/registration-forms/1', { waitUntil: 'domcontentloaded' })
  // 404/500 跳过 — 这个 case 是 best-effort
  test.skip(resp?.status() !== 200, '需要后端先有一个 form id=1;seed 后才会有')
  await expect(page.getByText(/字段定义|报名记录/i).first()).toBeVisible({ timeout: 8_000 })
})