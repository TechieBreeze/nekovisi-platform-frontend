import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '@/platform/auth/useAuth'

interface RequireAuthProps {
  children: ReactNode
}

/**
 * 路由守卫:未登录 → /login,登录后跳回原路径(state.from)。
 *
 * 不在这里判断角色,角色判断交给 RequireRole,这样嵌套 /admin 路由能精确控制。
 */
export default function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  }

  return <>{children}</>
}
