import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import ContestForm from '@/modules/contest/components/ContestForm'
import { useCreateContest } from '@/modules/contest/hooks/useContests'
import { ApiError } from '@/platform/api/errors'

export default function ContestCreatePage() {
  const navigate = useNavigate()
  const createMutation = useCreateContest()

  const handleSubmit = async (payload: Parameters<typeof createMutation.mutateAsync>[0]) => {
    try {
      const newId = await createMutation.mutateAsync(payload)
      navigate(`/admin/contests/${newId}`)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : '创建失败'
      toast.error(message)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">新建赛事</h1>
        <p className="text-sm text-muted-foreground">填写基本信息后创建,创建后可继续完善 JSONB 字段。</p>
      </header>
      <ContestForm
        submitting={createMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin/contests')}
      />
    </div>
  )
}
