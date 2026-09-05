import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'

import '@/styles/globals.css'
import App from '@/App'
import { hydrateAuth, useAuthStore } from '@/platform/auth/authStore'
import { install401Handler, queryClient } from '@/platform/api/queryClient'

/**
 * 启动顺序:
 *   1. hydrateAuth() 从 localStorage 灌回 token,顺手把 token getter 注册给 Axios
 *   2. install401Handler 挂 401 全局处理
 *   3. 才渲染 React 树
 *
 * 这样路由守卫第一次渲染时 authStore 已经是 hydrate 过的状态,不会把已登录用户
 * 误踢回 /login。
 */

// 1. 恢复会话
hydrateAuth()

// 2. 401 全局拦截:清 token + 派发自定义事件(由 App.tsx 里的 AuthEventBridge 跳 /login)
install401Handler(() => useAuthStore.getState().clearAuth())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
