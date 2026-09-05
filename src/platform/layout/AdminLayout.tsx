import { Outlet } from 'react-router-dom'

import Sidebar from '@/platform/layout/Sidebar'
import Topbar from '@/platform/layout/Topbar'

/**
 * 后台整体布局:左侧导航 + 顶栏用户区 + Outlet 内容。
 *
 * 设计决策:
 *   - 固定 sidebar (256px 宽),内容区自适应;不引入 resizable splitter,MVP 阶段不必要
 *   - 顶栏只显示用户和登出;搜索 / 通知等留作后续
 *   - 移动端后续讨论;MVP 只考虑 1024+
 */
export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
