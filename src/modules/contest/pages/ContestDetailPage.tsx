import { Link, useNavigate, useParams } from 'react-router-dom'
import { Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import ContestStatusBadge from '@/modules/contest/components/ContestStatusBadge'
import ContestStatusActions from '@/modules/contest/components/ContestStatusActions'
import { useContestDetail } from '@/modules/contest/hooks/useContests'
import { formatDurationHuman } from '@/shared/utils/duration'
import { formatDateTime } from '@/shared/utils/datetime'

/**
 * 赛事详情页 — 顶部信息卡 + 状态机操作区 + JSONB 字段展示。
 *
 * JSONB 字段(medalConfigJson / exportFieldsJson)按字符串原文展示 + pretty-print,
 * MVP 不做表单编辑,后续加 JSON 编辑器再说。
 */
export default function ContestDetailPage() {
  const { id: idStr } = useParams<{ id: string }>()
  const id = Number(idStr)
  const navigate = useNavigate()
  const { data: contest, isLoading, isError, error } = useContestDetail(Number.isFinite(id) ? id : undefined)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (isError || !contest) {
    return (
      <div className="surface-card mx-auto max-w-4xl p-8 text-center">
        <p className="text-sm text-destructive">加载赛事失败:{String(error)}</p>
        <Button variant="outline" className="mt-3" onClick={() => navigate('/admin/contests')}>
          返回列表
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/admin/contests" className="hover:text-foreground hover:underline">
              赛事管理
            </Link>
            <span>/</span>
            <span>#{contest.id}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{contest.name}</h1>
            <ContestStatusBadge status={contest.status} />
          </div>
        </div>
        <Button asChild variant="outline">
          <Link to={`/admin/contests/${contest.id}/edit`}>
            <Pencil className="size-3.5" />
            编辑
          </Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">状态机</CardTitle>
        </CardHeader>
        <CardContent>
          <ContestStatusActions contestId={contest.id} current={contest.status} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">基本信息</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            <DetailRow label="开始时间" value={formatDateTime(contest.startTime)} />
            <DetailRow label="比赛时长" value={formatDurationHuman(contest.durationSeconds)} />
            <DetailRow
              label="封榜时长"
              value={
                contest.freezeDurationSeconds
                  ? formatDurationHuman(contest.freezeDurationSeconds)
                  : '未设置'
              }
            />
            <DetailRow
              label="热备赛"
              value={
                contest.warmupStartTime
                  ? `${formatDateTime(contest.warmupStartTime)} · ${
                      contest.warmupDurationSeconds
                        ? formatDurationHuman(contest.warmupDurationSeconds)
                        : '无时长'
                    }`
                  : '未启用'
              }
            />
            <DetailRow label="前缀" value={contest.prefix ?? '未设置'} mono />
            <DetailRow label="密码长度" value={String(contest.passwordLength ?? '—')} />
            <DetailRow label="罚时(分钟)" value={String(contest.penaltyTime ?? '—')} />
            <DetailRow label="可见性" value={contest.isPublic ? '公开' : '私有'} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">JSONB 配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <JsonBlock title="medalConfigJson" value={contest.medalConfigJson} />
          <Separator />
          <JsonBlock title="exportFieldsJson" value={contest.exportFieldsJson} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">审计信息</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            <DetailRow label="创建者" value={`#${contest.createdBy}`} mono />
            <DetailRow label="创建时间" value={formatDateTime(contest.createdAt)} />
            <DetailRow label="更新时间" value={formatDateTime(contest.updatedAt)} />
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={['text-right', mono ? 'font-mono text-xs' : ''].join(' ')}>{value}</dd>
    </div>
  )
}

function JsonBlock({ title, value }: { title: string; value: string | null }) {
  if (!value) {
    return (
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <p className="text-sm text-muted-foreground/70 italic">未设置</p>
      </div>
    )
  }

  let pretty = value
  try {
    pretty = JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    // 原始字符串不是合法 JSON,按原文展示
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <pre className="max-h-72 overflow-auto rounded-md bg-muted p-3 font-mono text-xs">
        {pretty}
      </pre>
    </div>
  )
}
