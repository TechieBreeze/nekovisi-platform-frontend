import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'

import LoginForm from '@/modules/auth/components/LoginForm'
import { useAuth } from '@/platform/auth/useAuth'

/**
 * 登录页 — 居中卡片 + 品牌头部 + LoginForm。
 *
 * 已登录访问 /login 时自动跳 /admin/contests(避免回环)。
 */
export default function LoginPage() {
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    document.title = '登录 · Nekovisi'
  }, [])

  if (isAuthenticated) {
    return <Navigate to="/admin/contests" replace />
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-semibold shadow-sm">
            N
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Nekovisi · 集训队综合平台</h1>
          <p className="text-sm text-muted-foreground">赛事管理后台</p>
        </div>

        <div className="surface-card-elevated p-6">
          <h2 className="mb-4 text-base font-medium">管理员登录</h2>
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          MVP 阶段仅供管理员使用。问题反馈请联系平台负责人。
        </p>
      </div>
    </main>
  )
}
