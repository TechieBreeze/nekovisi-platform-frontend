import { Link } from 'react-router-dom'
import { Eye, Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

import ContestStatusBadge from '@/modules/contest/components/ContestStatusBadge'
import { formatDurationHuman } from '@/shared/utils/duration'
import { formatDateTimeShort } from '@/shared/utils/datetime'
import type { ContestListItem } from '@/modules/contest/types/contest'

/**
 * 赛事列表表格 — shadcn Table + 操作列按钮 + 加载骨架。
 *
 * 行点击跳详情;操作列 3 个按钮(查看/编辑/删除)各自独立按钮,避免 cell-click 误操作。
 */

interface ContestTableProps {
  items: ContestListItem[]
  loading?: boolean
  onDelete: (contest: ContestListItem) => void
}

const SKELETON_ROWS = 5

export default function ContestTable({ items, loading, onDelete }: ContestTableProps) {
  if (loading) {
    return <SkeletonRows />
  }

  if (items.length === 0) {
    return (
      <div className="surface-card flex flex-col items-center justify-center gap-2 p-12 text-center">
        <p className="text-sm text-muted-foreground">暂无赛事</p>
        <p className="text-xs text-muted-foreground">点击右上角"新建赛事"开始</p>
      </div>
    )
  }

  return (
    <div className="surface-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead>名称</TableHead>
            <TableHead>开始时间</TableHead>
            <TableHead>时长</TableHead>
            <TableHead>状态</TableHead>
            <TableHead className="w-24">公开</TableHead>
            <TableHead className="w-44 text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-mono text-xs text-muted-foreground">#{c.id}</TableCell>
              <TableCell>
                <Link
                  to={`/admin/contests/${c.id}`}
                  className="font-medium hover:text-primary hover:underline"
                >
                  {c.name}
                </Link>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDateTimeShort(c.startTime)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDurationHuman(c.durationSeconds)}
              </TableCell>
              <TableCell>
                <ContestStatusBadge status={c.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {c.isPublic ? '公开' : '私有'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/admin/contests/${c.id}`}>
                      <Eye className="size-3.5" />
                      查看
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/admin/contests/${c.id}/edit`}>
                      <Pencil className="size-3.5" />
                      编辑
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(c)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    删除
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function SkeletonRows() {
  return (
    <div className="surface-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead>名称</TableHead>
            <TableHead>开始时间</TableHead>
            <TableHead>时长</TableHead>
            <TableHead>状态</TableHead>
            <TableHead className="w-24">公开</TableHead>
            <TableHead className="w-44 text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-8" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-48" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-14" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-12" />
              </TableCell>
              <TableCell>
                <Skeleton className="ml-auto h-7 w-32" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
