import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State {
  error: Error | null
}

interface Props {
  children: ReactNode
}

/**
 * 全局错误兜底 — React 渲染抛错时显示降级 UI,不白屏。
 *
 * 不在这里接 toast / Sentry,只做"至少给用户看个能用的页"。
 * 真实错误上报在 Phase 7 文档里规划,本期先 console.error。
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  private handleReset = (): void => {
    this.setState({ error: null })
  }

  private handleReload = (): void => {
    window.location.reload()
  }

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <main className="flex min-h-screen items-center justify-center px-6">
          <div className="surface-card max-w-lg space-y-4 p-8">
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">页面出错了</p>
              <h1 className="text-xl font-semibold">渲染异常</h1>
              <p className="text-sm text-muted-foreground">
                已经记录到控制台。请截图反馈给开发者。
              </p>
            </div>
            <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">
              {this.state.error.message}
            </pre>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-muted"
              >
                重试
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
              >
                刷新页面
              </button>
            </div>
          </div>
        </main>
      )
    }
    return this.props.children
  }
}
