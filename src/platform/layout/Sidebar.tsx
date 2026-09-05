import { NavLink } from 'react-router-dom'
import { ClipboardList, Trophy, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/admin/contests', label: '赛事管理', icon: Trophy, end: false },
  { to: '/admin/registration-forms', label: '报名表', icon: ClipboardList, end: false },
  // 其他模块占位;MVP 只放赛事 + 报名表
  { to: '#', label: '系统设置(待启用)', icon: Settings, end: false, disabled: true },
] as const

/**
 * 左侧导航。MVP 含"赛事管理" + "报名表"两项;其他模块占位但 disabled,
 * 避免后续塞菜单时再次打扰用户(并保持视觉节奏一致)。
 */
export default function Sidebar() {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center gap-2 border-b border-border px-5">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold">
          N
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">Nekovisi</span>
          <span className="text-[11px] text-muted-foreground">集训队综合平台</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isDisabled = 'disabled' in item && item.disabled

          if (isDisabled) {
            return (
              <div
                key={item.to}
                className="flex cursor-not-allowed items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground/60"
                aria-disabled="true"
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </div>
            )
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : undefined}
              className={({ isActive }) =>
                [
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground/80 hover:bg-muted hover:text-foreground',
                ].join(' ')
              }
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-border p-3 text-[11px] text-muted-foreground">
        v0.1.0 · MVP
      </div>
    </aside>
  )
}
