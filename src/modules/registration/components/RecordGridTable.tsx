import { Pencil, Trash2 } from 'lucide-react'

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

import type { FieldDef, RecordListItem } from '@/modules/registration/types/registration'
import { formatDateTimeShort } from '@/shared/utils/datetime'

interface RecordGridTableProps {
  fields: FieldDef[]
  items: RecordListItem[]
  loading?: boolean
  onEdit: (record: RecordListItem) => void
  onDelete: (record: RecordListItem) => void
}

const SKELETON_ROWS = 5

/**
 * 报名记录 grid — 列 = 字段定义(keys),行 = 记录。
 *
 * 单元格渲染规则:
 *   - 文本 / 数字:直接显示
 *   - 多选:逗号分隔
 *   - 缺失字段:"—" 灰显
 *   - data 里的未知 key(老字段):不渲染,跟随字段定义
 */
export default function RecordGridTable({
  fields,
  items,
  loading,
  onEdit,
  onDelete,
}: RecordGridTableProps) {
  if (loading) return <SkeletonRows fields={fields} />

  if (items.length === 0) {
    return (
      <div className="surface-card flex flex-col items-center justify-center gap-2 p-12 text-center">
        <p className="text-sm text-muted-foreground">暂无报名记录</p>
        <p className="text-xs text-muted-foreground">点击右上角"新增记录"开始</p>
      </div>
    )
  }

  return (
    <div className="surface-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead className="w-24">来源</TableHead>
            {fields.map((f) => (
              <TableHead key={f.key}>{f.label}</TableHead>
            ))}
            <TableHead className="w-40">更新时间</TableHead>
            <TableHead className="w-24 text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-mono text-xs text-muted-foreground">#{r.id}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{r.source || 'manual'}</TableCell>
              {fields.map((f) => (
                <TableCell key={f.key} className="text-sm">
                  {renderCellValue(r.data[f.key])}
                </TableCell>
              ))}
              <TableCell className="text-xs text-muted-foreground">
                {formatDateTimeShort(r.updatedAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(r)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(r)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
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

function renderCellValue(v: string | number | string[] | undefined): string {
  if (v === undefined || v === null || v === '') return '—'
  if (Array.isArray(v)) return v.join(', ')
  return String(v)
}

function SkeletonRows({ fields }: { fields: FieldDef[] }) {
  return (
    <div className="surface-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead className="w-24">来源</TableHead>
            {fields.map((f) => (
              <TableHead key={f.key}>{f.label}</TableHead>
            ))}
            <TableHead className="w-40">更新时间</TableHead>
            <TableHead className="w-24 text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-8" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              {fields.map((f) => (
                <TableCell key={f.key}><Skeleton className="h-4 w-24" /></TableCell>
              ))}
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="ml-auto h-7 w-16" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}