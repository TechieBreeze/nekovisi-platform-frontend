import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import {
  nextStatesOf,
  type ContestStatus,
} from '@/modules/contest/types/contest'
import { useChangeContestStatus } from '@/modules/contest/hooks/useContests'
import { ApiError } from '@/platform/api/errors'

/**
 * 状态机按钮组 — 根据当前状态算出所有可达下一态,每个目标一个按钮。
 *
 * 点击先弹二次确认 Dialog(避免误操作把赛事推进到 ENDED 这种不可逆状态),
 * 确认后调 changeContestStatus mutation。
 *
 * 非法转移由后端 409 拦截;前端先校验 canTransitTo 减少 409 次数,
 * 但即使前端放过(并发场景),后端也会挡。
 */

const STATUS_LABEL: Record<ContestStatus, string> = {
  PLANNING: '已规划',
  READY: '就绪',
  RUNNING: '进行中',
  FROZEN: '已冻结',
  ENDED: '已结束',
  ARCHIVING: '归档中',
  ARCHIVED: '已归档',
}

interface ContestStatusActionsProps {
  contestId: number
  current: ContestStatus
}

export default function ContestStatusActions({ contestId, current }: ContestStatusActionsProps) {
  const nextStates = nextStatesOf(current)
  const change = useChangeContestStatus(contestId)
  const [pending, setPending] = useState<ContestStatus | null>(null)

  if (nextStates.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        当前状态 <code className="rounded bg-muted px-1.5 py-0.5">{current}</code> 已终态,无可达操作。
      </p>
    )
  }

  const confirm = async () => {
    if (!pending) return
    try {
      await change.mutateAsync(pending)
    } catch (err) {
      // mutation 已经 toast 成功;失败时 mutation 没 toast,这里补一条
      const message = err instanceof ApiError ? err.message : '状态变更失败'
      // eslint-disable-next-line no-alert
      alert(message)
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {nextStates.map((target) => (
          <Button
            key={target}
            size="sm"
            variant={isDestructive(target) ? 'destructive' : 'secondary'}
            onClick={() => setPending(target)}
            disabled={change.isPending}
          >
            推进至 {STATUS_LABEL[target]}
          </Button>
        ))}
      </div>

      <Dialog open={pending !== null} onOpenChange={(open: boolean) => !open && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认变更状态?</DialogTitle>
            <DialogDescription>
              {current} → {pending}
              <br />
              部分状态变更不可逆(如 {current} → ENDED),确认后无法直接回滚。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPending(null)} disabled={change.isPending}>
              取消
            </Button>
            <Button onClick={confirm} disabled={change.isPending}>
              {change.isPending ? '提交中…' : '确认'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function isDestructive(status: ContestStatus): boolean {
  // ENDED / ARCHIVED 这类推进用 destructive 视觉;其他用 secondary
  return status === 'ENDED' || status === 'ARCHIVING' || status === 'ARCHIVED'
}
