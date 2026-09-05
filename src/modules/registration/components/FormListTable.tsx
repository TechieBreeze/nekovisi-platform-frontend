import { Link } from 'react-router-dom'
import { Eye, Trash2 } from 'lucide-react'

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

import type { RegistrationFormListItem } from '@/modules/registration/hooks/useRegistrationForms'
import { formatDateTimeShort } from '@/shared/utils/datetime'

interface FormListTableProps {
  items: RegistrationFormListItem[]
  loading?: boolean
  onDelete: (form: RegistrationFormListItem) => void
}

const SKELETON_ROWS = 5

export default function FormListTable({ items, loading, onDelete }: FormListTableProps) {
  if (loading) return <SkeletonRows />

  if (items.length === 0) {
    return (
      <div className="surface-card flex flex-col items-center justify-center gap-2 p-12 text-center">
        <p className="text-sm text-muted-foreground">暂无报名表</p>
        <p className="text-xs text-muted-foreground">点击右上角"新建表单"开始</p>
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
            <TableHead className="w-24">记录数</TableHead>
            <TableHead className="w-24">来源数</TableHead>
            <TableHead className="w-44">更新时间</TableHead>
            <TableHead className="w-24 text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((f) => (
            <TableRow key={f.id}>
              <TableCell className="font-mono text-xs text-muted-foreground">#{f.id}</TableCell>
              <TableCell>
                <Link
                  to={`/admin/registration-forms/${f.id}`}
                  className="font-medium hover:text-primary hover:underline"
                >
                  {f.name}
                </Link>
                {f.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                    {f.description}
                  </p>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{f.recordCount}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{f.sourceCount}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDateTimeShort(f.updatedAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/admin/registration-forms/${f.id}`}>
                      <Eye className="size-3.5" />
                      查看
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(f)}
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
            <TableHead className="w-24">记录数</TableHead>
            <TableHead className="w-24">来源数</TableHead>
            <TableHead className="w-44">更新时间</TableHead>
            <TableHead className="w-24 text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-8" /></TableCell>
              <TableCell><Skeleton className="h-4 w-48" /></TableCell>
              <TableCell><Skeleton className="h-4 w-12" /></TableCell>
              <TableCell><Skeleton className="h-4 w-12" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="ml-auto h-7 w-16" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}