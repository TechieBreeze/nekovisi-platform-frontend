import type { ReactNode } from 'react'

import { useAuth } from '@/platform/auth/useAuth'
import type { Role } from '@/shared/types/role'

interface RequireRoleProps {
  role: Role
  children: ReactNode
}

/**
 * 角色守卫:等级不够 → 403 占位页(不进 /login,那是未登录的去处)。
 *
 * MVP 限定:后端 AuthController 给所有登录用户硬编码 SUPER_ADMIN,
 * 真实 RBAC 上线后这个守卫才有实际意义。这里先把壳子立起来。
 */
export default function RequireRole({ role, children }: RequireRoleProps) {
  const { hasRole } = useAuth()
  const allowed = hasRole(role)

  if (!allowed) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="surface-card max-w-md space-y-3 p-8 text-center">
          <p className="text-sm font-medium text-muted-foreground">403</p>
          <h1 className="text-xl font-semibold">权限不足</h1>
          <p className="text-sm text-muted-foreground">
            当前账号没有访问该页面的权限。需要角色:<code className="rounded bg-muted px-1.5 py-0.5">{role}</code>
          </p>
          <p className="text-xs text-muted-foreground">
            MVP 阶段后端硬编码 SUPER_ADMIN;若确认自己有权限但仍看到这个页,请联系管理员。
          </p>
        </div>
      </main>
    )
  }

  return <>{children}</>
}
