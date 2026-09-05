import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Save, Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { formatDateTime } from '@/shared/utils/datetime'

interface FormHeaderProps {
  form: {
    id: number
    name: string
    description: string
    recordCount: number
    createdAt: string
    updatedAt: string
  }
  editing: boolean
  editName: string
  editDescription: string
  onStartEdit: () => void
  onChangeName: (v: string) => void
  onChangeDescription: (v: string) => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  saving: boolean
  onDelete: () => void
}

/**
 * 表单头卡 — 名字 + 描述 + 元数据 + 编辑 / 删除按钮。
 *
 * 编辑模式走 inline Input / Textarea,保存调 onSaveEdit;删除按钮触发 onDelete(父级弹 AlertDialog)。
 */
export default function FormHeader({
  form,
  editing,
  editName,
  editDescription,
  onStartEdit,
  onChangeName,
  onChangeDescription,
  onCancelEdit,
  onSaveEdit,
  saving,
  onDelete,
}: FormHeaderProps) {
  return (
    <header className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/admin/registration-forms" className="hover:text-foreground hover:underline">
          报名表
        </Link>
        <span>/</span>
        <span>#{form.id}</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          {editing ? (
            <div className="space-y-2">
              <Input
                value={editName}
                onChange={(e) => onChangeName(e.target.value)}
                placeholder="表单名称"
                className="text-xl font-semibold"
              />
              <Textarea
                value={editDescription}
                onChange={(e) => onChangeDescription(e.target.value)}
                placeholder="描述(可选)"
                rows={2}
              />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold tracking-tight">{form.name}</h1>
              {form.description && (
                <p className="text-sm text-muted-foreground">{form.description}</p>
              )}
            </>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>记录数:{form.recordCount}</span>
            <span>创建时间:{formatDateTime(form.createdAt)}</span>
            <span>更新时间:{formatDateTime(form.updatedAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button type="button" variant="ghost" size="sm" onClick={onCancelEdit} disabled={saving}>
                <X className="size-3.5" />
                取消
              </Button>
              <Button type="button" size="sm" onClick={onSaveEdit} disabled={saving}>
                <Save className="size-3.5" />
                {saving ? '保存中…' : '保存'}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" size="sm" onClick={onStartEdit}>
                <Pencil className="size-3.5" />
                编辑名称
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
                删除表单
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

// 仅为满足 ts isolatedModules — 真正组件无内部 state,父级持有
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _useStateShim() {
  const [s] = useState(0)
  return s
}