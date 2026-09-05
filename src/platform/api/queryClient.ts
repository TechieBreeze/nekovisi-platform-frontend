/**
 * TanStack Query 配置
 *
 * 关键决策:
 *   - staleTime 默认 30s:列表页短时间内重复进不重新打后端
 *   - retry:1(只重试一次,网络抖动兜底;业务错误 4xx 不该重试 — 我们在 mutation
 *     hook 里也写清楚 mutation 不重试)
 *   - refetchOnWindowFocus:false — 后端暂无实时性,焦点切回不刷
 *   - 全局 onError 不在这里挂;组件级 onError 各自处理 toast,
 *     queryClient 只负责"401 全局清 token + 跳 /login"
 *
 * 401 拦截策略:
 *   - 由 platform/auth/authStore 提供 `clearAuth()` 入口
 *   - 在 queryClient 的 `queryCache` / `mutationCache` 上挂订阅,识别 ApiError 后清 token
 *   - 跳路由由 Router 层监听 authStore 状态变化触发,不在这里直接 navigate
 *     (避免引入对 react-router 的依赖)
 */

import { QueryClient } from '@tanstack/react-query'

import { ApiError } from '@/platform/api/errors'

const STALE_TIME_MS = 30_000
const GC_TIME_MS = 5 * 60_000 // 5 分钟

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      gcTime: GC_TIME_MS,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && !error.isRetryable) return false
        return failureCount < 1
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: false,
    },
  },
})

/**
 * 401 全局处理器 — 由 App 启动时调用一次。
 *
 * 流程:清 auth → window 上派发自定义事件 `nekovisi:auth:cleared` →
 * Router 层监听这个事件后 navigate('/login')。
 *
 * 这样避免 queryClient 直接 import router,继续保持横切能力解耦。
 */
export function install401Handler(clearAuth: () => void): void {
  const handler = (event: { query?: { state: { error: unknown } }; mutation?: { state: { error: unknown } } }) => {
    const err = event?.query?.state?.error ?? event?.mutation?.state?.error
    if (err instanceof ApiError && err.isUnauthorized) {
      clearAuth()
      window.dispatchEvent(new CustomEvent('nekovisi:auth:cleared'))
    }
  }

  queryClient.getQueryCache().subscribe(handler as never)
  queryClient.getMutationCache().subscribe(handler as never)
}
