import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'

import ErrorBoundary from '@/platform/components/ErrorBoundary'
import AuthEventBridge from '@/platform/auth/AuthEventBridge'
import RequireAuth from '@/platform/auth/RequireAuth'
import RequireRole from '@/platform/auth/RequireRole'
import AdminLayout from '@/platform/layout/AdminLayout'

import LoginPage from '@/modules/auth/pages/LoginPage'
import ContestListPage from '@/modules/contest/pages/ContestListPage'
import ContestCreatePage from '@/modules/contest/pages/ContestCreatePage'
import ContestDetailPage from '@/modules/contest/pages/ContestDetailPage'
import ContestEditPage from '@/modules/contest/pages/ContestEditPage'

/**
 * 路由表
 *
 * /login          公开
 * /admin/*        RequireAuth + RequireRole(SUPER_ADMIN)
 *   /contests     列表
 *   /contests/new 新建
 *   /contests/:id 详情(含状态机)
 *   /contests/:id/edit 编辑
 * /               → /admin/contests
 * *               404 占位
 */
export default function App() {
  return (
    <ErrorBoundary>
      <AuthEventBridge />
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/admin"
          element={
            <RequireAuth>
              <RequireRole role="SUPER_ADMIN">
                <AdminLayout />
              </RequireRole>
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/admin/contests" replace />} />
          <Route path="contests" element={<ContestListPage />} />
          <Route path="contests/new" element={<ContestCreatePage />} />
          <Route path="contests/:id" element={<ContestDetailPage />} />
          <Route path="contests/:id/edit" element={<ContestEditPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/admin/contests" replace />} />

        <Route
          path="*"
          element={
            <main className="flex min-h-screen items-center justify-center px-6">
              <div className="surface-card max-w-md space-y-3 p-8 text-center">
                <p className="text-sm font-medium text-muted-foreground">404</p>
                <h1 className="text-xl font-semibold">页面不存在</h1>
                <p className="text-sm text-muted-foreground">
                  你访问的路径不存在,可能已被移除。
                </p>
                <a
                  href="/admin/contests"
                  className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  返回赛事列表
                </a>
              </div>
            </main>
          }
        />
      </Routes>
    </ErrorBoundary>
  )
}
