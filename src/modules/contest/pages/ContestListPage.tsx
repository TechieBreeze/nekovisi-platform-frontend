import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import ContestTable from '@/modules/contest/components/ContestTable'
import { useContestList, useDeleteContest } from '@/modules/contest/hooks/useContests'
import type { ContestListItem, ContestStatus } from '@/modules/contest/types/contest'

/**
 * 赛事列表页 — 顶部操作条 + 状态筛选 + 表格 + 分页 + 删除二次确认。
 *
 * 状态筛选用 Select 组件;"全部"映射成空串,query 里不带 status 参数。
 */

const STATUS_OPTIONS: Array<{ value: ContestStatus | '__ALL__'; label: string }> = [
  { value: '__ALL__', label: '全部状态' },
  { value: 'PLANNING', label: '已规划' },
  { value: 'READY', label: '就绪' },
  { value: 'RUNNING', label: '进行中' },
  { value: 'FROZEN', label: '已冻结' },
  { value: 'ENDED', label: '已结束' },
  { value: 'ARCHIVING', label: '归档中' },
  { value: 'ARCHIVED', label: '已归档' },
]

export default function ContestListPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<ContestStatus | '__ALL__'>('__ALL__')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [toDelete, setToDelete] = useState<ContestListItem | null>(null)

  const query = {
    page,
    size: pageSize,
    status: statusFilter === '__ALL__' ? undefined : (statusFilter as ContestStatus),
  }

  const { data, isLoading, isError, error, refetch } = useContestList(query)
  const deleteMutation = useDeleteContest()

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const handleConfirmDelete = async () => {
    if (!toDelete) return
    await deleteMutation.mutateAsync(toDelete.id)
    setToDelete(null)
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">赛事管理</h1>
          <p className="text-sm text-muted-foreground">
            共 {total} 条 · 第 {page} / {totalPages} 页
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => {
            setStatusFilter(v as ContestStatus | '__ALL__')
            setPage(1)
          }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => navigate('/admin/contests/new')}>
            <Plus className="size-4" />
            新建赛事
          </Button>
        </div>
      </header>

      {isError ? (
        <div className="surface-card flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-sm text-destructive">加载失败:{String(error)}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <Search className="size-3.5" />
            重试
          </Button>
        </div>
      ) : (
        <ContestTable items={items} loading={isLoading} onDelete={(c) => setToDelete(c)} />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            上一页
          </Button>
          <span className="text-sm text-muted-foreground">
            第 {page} / {totalPages} 页
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            下一页
          </Button>
        </div>
      )}

      <AlertDialog open={toDelete !== null} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除赛事?</AlertDialogTitle>
            <AlertDialogDescription>
              将删除 <strong>{toDelete?.name}</strong>(ID: {toDelete?.id})。
              这是软删除,数据可在数据库中恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>取消</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? '删除中…' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
