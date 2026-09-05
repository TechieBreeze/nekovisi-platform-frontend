import { Button } from '@/components/ui/button'

/**
 * Scaffold smoke test page.
 *
 * 临时占位,后续接入真实路由壳。验证:
 *   1. Tailwind v4 + shadcn 主题生效(--primary 应是品牌蓝)
 *   2. 字体 = Geist
 *   3. shadcn Button 组件能渲染、focus 环跟着主题
 *   4. 自定义 surface-card 工具类工作
 *   5. 赛事状态机的 7 个 token 颜色可读
 */
function App() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Nekovisi · 集训队综合平台</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          前端脚手架 smoke test
        </h1>
        <p className="text-base text-muted-foreground">
          Vite 8 + React 19 + TS 6 + Tailwind v4 + shadcn/ui。
          如果按钮是品牌蓝、有圆角、焦点环可见,这一阶段就过了。
        </p>
      </header>

      <section className="surface-card space-y-4 p-6">
        <h2 className="text-lg font-medium">shadcn 组件</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>主要按钮</Button>
          <Button variant="secondary">次要按钮</Button>
          <Button variant="outline">描边按钮</Button>
          <Button variant="ghost">幽灵按钮</Button>
          <Button variant="destructive">危险按钮</Button>
          <Button size="sm" variant="secondary">小号</Button>
          <Button size="lg">大号</Button>
        </div>
      </section>

      <section className="surface-card-elevated space-y-4 p-6">
        <h2 className="text-lg font-medium">赛事状态机 token 预览</h2>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <StatusPreview status="planning" label="已规划" />
          <StatusPreview status="ready" label="就绪" />
          <StatusPreview status="running" label="进行中" />
          <StatusPreview status="frozen" label="已冻结" />
          <StatusPreview status="ended" label="已结束" />
          <StatusPreview status="archiving" label="归档中" />
          <StatusPreview status="archived" label="已归档" />
        </dl>
      </section>

      <footer className="text-xs text-muted-foreground">
        下一阶段:登录 + 赛事管理后台。
      </footer>
    </main>
  )
}

function StatusPreview({ status, label }: { status: string; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className="rounded-md px-2 py-1 text-xs font-medium"
        style={{
          color: `var(--contest-status-${status}-fg)`,
          background: `var(--contest-status-${status}-bg)`,
        }}
      >
        {status.toUpperCase()}
      </dd>
    </div>
  )
}

export default App