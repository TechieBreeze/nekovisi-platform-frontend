import type { ContestStatus } from '@/modules/contest/types/contest'

/**
 * 状态徽章 — 7 色一一对应后端 ContestStatus 枚举。
 *
 * 颜色取自 tokens.css 里的 --contest-status-<name>-{fg,bg},
 * 后端改枚举时这里同步加。
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

interface ContestStatusBadgeProps {
  status: ContestStatus
  className?: string
}

export default function ContestStatusBadge({ status, className }: ContestStatusBadgeProps) {
  return (
    <span
      data-status={status}
      className={[
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        className ?? '',
      ].join(' ')}
      style={{
        color: `var(--contest-status-${status.toLowerCase()}-fg)`,
        background: `var(--contest-status-${status.toLowerCase()}-bg)`,
      }}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}
