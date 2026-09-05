import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/platform/auth/useAuth'
import { logout as logoutApi } from '@/platform/auth/authApi'
import { ROLE_LABEL } from '@/shared/types/role'

/**
 * 顶栏:右侧用户区(角色徽章 + 登出)。
 *
 * MVP 简化:不显示头像 / 通知 / 主题切换;这些等 RBAC 上线后再补。
 *
 * 登出顺序:
 *   1. 调 /api/auth/logout(MVP 服务端是 no-op,留个钩子)
 *   2. 清 localStorage + store
 *   3. 跳 /login
 * 即使第 1 步失败,也要清本地 — 否则用户以为登出了其实没。
 */
export default function Topbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch {
      // 忽略服务端错误,本地清就够
    }
    logout()
    toast.success('已登出')
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex h-14 items-center justify-end gap-3 border-b border-border bg-card px-6">
      {user ? (
        <>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
              {user.username.slice(0, 1).toUpperCase()}
            </div>
            <span className="font-medium">{user.username}</span>
            {user.roles[0] && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {ROLE_LABEL[user.roles[0]]}
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="size-3.5" />
            登出
          </Button>
        </>
      ) : null}
    </header>
  )
}
