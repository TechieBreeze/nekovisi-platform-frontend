import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
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

import FormListTable from '@/modules/registration/components/FormListTable'
import {
  useDeleteForm,
  useFormList,
} from '@/modules/registration/hooks/useRegistrationForms'
import type { RegistrationFormListItem } from '@/modules/registration/hooks/useRegistrationForms'

/**
 * 报名表列表页 — 顶栏 + 表格 + 分页 + 删除二次确认。
 */
export default function RegistrationFormListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [toDelete, setToDelete] = useState<RegistrationFormListItem | null>(null)

  const { data, isLoading, isError, error, refetch } = useFormList({ page, size: pageSize })
  const deleteMutation = useDeleteForm()

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
          <h1 className="text-2xl font-semibold tracking-tight">报名表</h1>
          <p className="text-sm text-muted-foreground">
            共 {total} 条 · 第 {page} / {totalPages} 页
          </p>
        </div>
        <Button onClick={() => navigate('/admin/registration-forms/new')}>
          <Plus className="size-4" />
          新建表单
        </Button>
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
        <FormListTable items={items} loading={isLoading} onDelete={(f) => setToDelete(f)} />
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
            <AlertDialogTitle>确认删除报名表?</AlertDialogTitle>
            <AlertDialogDescription>
              将删除 <strong>{toDelete?.name}</strong>(ID: {toDelete?.id}) 及其全部报名记录。
              此操作不可恢复。
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