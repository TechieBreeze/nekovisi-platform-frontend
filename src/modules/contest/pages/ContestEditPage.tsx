import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import ContestForm from '@/modules/contest/components/ContestForm'
import { Skeleton } from '@/components/ui/skeleton'
import { useContestDetail, useUpdateContest } from '@/modules/contest/hooks/useContests'
import { ApiError } from '@/platform/api/errors'

export default function ContestEditPage() {
  const { id: idStr } = useParams<{ id: string }>()
  const id = Number(idStr)
  const navigate = useNavigate()
  const { data: contest, isLoading, isError, error } = useContestDetail(Number.isFinite(id) ? id : undefined)
  const updateMutation = useUpdateContest(Number.isFinite(id) ? id : -1)

  const handleSubmit = async (payload: Parameters<typeof updateMutation.mutateAsync>[0]) => {
    try {
      await updateMutation.mutateAsync(payload)
      navigate(`/admin/contests/${id}`)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : '更新失败'
      toast.error(message)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !contest) {
    return (
      <div className="surface-card mx-auto max-w-3xl p-8 text-center">
        <p className="text-sm text-destructive">加载赛事失败:{String(error)}</p>
        <button
          type="button"
          className="mt-3 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
          onClick={() => navigate('/admin/contests')}
        >
          返回列表
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">编辑赛事</h1>
        <p className="text-sm text-muted-foreground">#{contest.id} · {contest.name}</p>
      </header>
      <ContestForm
        initial={{
          name: contest.name,
          startTime: contest.startTime,
          durationSeconds: contest.durationSeconds,
          freezeDurationSeconds: contest.freezeDurationSeconds,
          prefix: contest.prefix,
          passwordLength: contest.passwordLength,
          penaltyTime: contest.penaltyTime,
          isPublic: contest.isPublic,
        }}
        submitting={updateMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/admin/contests/${id}`)}
      />
    </div>
  )
}
