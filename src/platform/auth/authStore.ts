/**
 * 鉴权状态 — Zustand store + localStorage 持久化(MVP 简单实现)
 *
 * 数据结构:
 *   - accessToken:    15 分钟有效,API 请求必带
 *   - refreshToken:   7 天有效,access 过期时换新
 *   - user:           登录后从 /api/auth/login 拿不到(MVP 不返 user 对象),
 *                     暂时只存 username,真正的 user 详情等后端 user 模块
 *   - roles:          MVP 后端硬编码 ["SUPER_ADMIN"],这里接的是后端 JWT claim
 *
 * 安全债(MVP 接受):
 *   - localStorage 存 token 容易被 XSS 偷;生产应换 httpOnly cookie
 *   - 没有 refresh 过期检测;真过期时 refresh 失败才会被踢回登录
 *
 * hydration:
 *   - 应用启动时 `hydrate()` 把 localStorage 里的值灌回 store
 *   - hydrate 完成前路由守卫可能误判未登录,所以 main.tsx 应当在 hydrate 后再渲染路由
 */

import { create } from 'zustand'

import type { Role } from '@/shared/types/role'
import { setAccessTokenGetter } from '@/platform/auth/tokenRef'

const STORAGE_KEY = 'nekovisi.auth.v1'

interface PersistedAuth {
  accessToken: string
  refreshToken: string
  username: string
  roles: Role[]
}

export interface AuthUser {
  username: string
  roles: Role[]
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null

  setAuth: (input: {
    accessToken: string
    refreshToken: string
    username: string
    roles: Role[]
  }) => void
  setAccessToken: (token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,

  setAuth: ({ accessToken, refreshToken, username, roles }) => {
    persist({ accessToken, refreshToken, username, roles })
    set({
      accessToken,
      refreshToken,
      user: { username, roles },
    })
  },

  setAccessToken: (token) => {
    set((state) => {
      // 仅替换 access,保留 refresh
      if (state.refreshToken && state.user) {
        persist({
          accessToken: token,
          refreshToken: state.refreshToken,
          username: state.user.username,
          roles: state.user.roles,
        })
      }
      return { accessToken: token }
    })
  },

  clearAuth: () => {
    clearPersisted()
    set({ accessToken: null, refreshToken: null, user: null })
  },
}))

// ===== localStorage 持久化 =====

function persist(auth: PersistedAuth): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
  } catch {
    // localStorage 满 / 隐私模式,静默忽略 — MVP 接受
  }
}

function readPersisted(): PersistedAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PersistedAuth>
    if (!parsed.accessToken || !parsed.refreshToken || !parsed.username) return null
    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      username: parsed.username,
      roles: Array.isArray(parsed.roles) ? (parsed.roles as Role[]) : [],
    }
  } catch {
    return null
  }
}

function clearPersisted(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

/**
 * 应用启动时调用一次,从 localStorage 恢复会话,并把 getter 注册给 tokenRef。
 *
 * 返回布尔:是否已登录(用于路由守卫和 Splash 闪屏判断)。
 */
export function hydrateAuth(): boolean {
  const persisted = readPersisted()
  if (persisted) {
    useAuthStore.setState({
      accessToken: persisted.accessToken,
      refreshToken: persisted.refreshToken,
      user: { username: persisted.username, roles: persisted.roles },
    })
  }

  // 每次 hydrate 都注册 / 更新 getter,确保 client 拿到的总是最新闭包
  setAccessTokenGetter(() => useAuthStore.getState().accessToken)

  return Boolean(persisted)
}
