import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

import FieldDefRow from '@/modules/registration/components/FieldDefRow'
import type { FieldDef } from '@/modules/registration/types/registration'

/**
 * 字段定义编辑器 — 多行 FieldDefRow + 添加按钮。
 *
 * 父级(详情页)管 fields 数组 dirty 状态,这里只管展示 + 通知变更。
 * key 重复 / key 不合法的错误在父级聚合后传入每行(本地不解析)。
 */

interface FieldDefEditorProps {
  fields: FieldDef[]
  onChange: (next: FieldDef[]) => void
  keyErrors?: Record<string, string> // key → 错误消息
}

export default function FieldDefEditor({ fields, onChange, keyErrors }: FieldDefEditorProps) {
  const handleAdd = () => {
    onChange([
      ...fields,
      {
        key: `field_${fields.length + 1}`,
        label: '',
        type: 'TEXT',
        required: false,
      },
    ])
  }

  const handleUpdate = (index: number, next: FieldDef) => {
    const arr = [...fields]
    arr[index] = next
    onChange(arr)
  }

  const handleRemove = (index: number) => {
    onChange(fields.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      {fields.map((f, i) => (
        <FieldDefRow
          key={i}
          index={i}
          field={f}
          onChange={(next) => handleUpdate(i, next)}
          onRemove={() => handleRemove(i)}
          keyError={keyErrors?.[f.key]}
        />
      ))}
      <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
        <Plus className="size-3.5" />
        添加字段
      </Button>
    </div>
  )
}