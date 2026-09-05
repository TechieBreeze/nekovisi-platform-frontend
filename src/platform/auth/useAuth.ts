/**
 * useAuth — 组件级鉴权 hook
 *
 * 用法:
 *   const { user, isAuthenticated, roles, login, logout, hasRole } = useAuth()
 *
 * 注意:不直接复用 authStore,而是封装一层,便于:
 *   1. 后续切换 session 策略(httpOnly cookie / OAuth)只改这里
 *   2. 给组件一个"派生"视图(hasRole / isAdmin 等),避免到处写 roles.includes
 */

import { useCallback } from 'react'

import type { Role } from '@/shared/types/role'
import { hasAtLeastRole } from '@/shared/types/role'
import { useAuthStore } from '@/platform/auth/authStore'

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)
  const refreshToken = useAuthStore((s) => s.refreshToken)
  const setAuth = useAuthStore((s) => s.setAuth)
  const setAccessToken = useAuthStore((s) => s.setAccessToken)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const isAuthenticated = Boolean(accessToken && user)
  const roles = user?.roles ?? []
  const primaryRole: Role | undefined = roles[0]

  const hasRole = useCallback(
    (required: Role) => hasAtLeastRole(primaryRole, required),
    [primaryRole],
  )

  return {
    user,
    isAuthenticated,
    roles,
    primaryRole,
    accessToken,
    refreshToken,
    hasRole,
    login: setAuth,
    refresh: setAccessToken,
    logout: clearAuth,
  }
}
