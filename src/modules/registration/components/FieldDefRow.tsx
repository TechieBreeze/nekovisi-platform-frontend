import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { FieldDef, FieldType } from '@/modules/registration/types/registration'

/**
 * 单条字段定义行 — 嵌在 FieldDefEditor 内。
 *
 * key / label / type / required 必填 + maxLength/min/max/options 按 type 条件渲染。
 * onChange 把变更传上去,父组件负责管理数组顺序。
 */

const FIELD_TYPES: Array<{ value: FieldType; label: string }> = [
  { value: 'TEXT', label: '单行文本' },
  { value: 'TEXTAREA', label: '多行文本' },
  { value: 'NUMBER', label: '数字' },
  { value: 'SELECT', label: '单选' },
  { value: 'MULTISELECT', label: '多选' },
  { value: 'DATE', label: '日期' },
]

interface FieldDefRowProps {
  index: number
  field: FieldDef
  onChange: (next: FieldDef) => void
  onRemove: () => void
  keyError?: string
}

export default function FieldDefRow({ index, field, onChange, onRemove, keyError }: FieldDefRowProps) {
  const showTextLength = field.type === 'TEXT' || field.type === 'TEXTAREA'
  const showNumberRange = field.type === 'NUMBER'
  const showOptions = field.type === 'SELECT' || field.type === 'MULTISELECT'

  const optionsText = Array.isArray(field.options) ? field.options.join('\n') : ''

  return (
    <div className="surface-card space-y-3 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">字段 #{index + 1}</span>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove} aria-label="删除字段">
          <Trash2 className="size-3.5 text-destructive" />
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor={`key-${index}`}>key</Label>
          <Input
            id={`key-${index}`}
            value={field.key}
            placeholder="team_name"
            onChange={(e) => onChange({ ...field, key: e.target.value })}
            aria-invalid={Boolean(keyError)}
          />
          {keyError && <p className="text-xs text-destructive">{keyError}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`label-${index}`}>label</Label>
          <Input
            id={`label-${index}`}
            value={field.label}
            placeholder="队伍名"
            onChange={(e) => onChange({ ...field, label: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`type-${index}`}>类型</Label>
          <Select
            value={field.type}
            onValueChange={(v) =>
              onChange({
                ...field,
                type: v as FieldType,
                // 切换类型时清空无关字段
                maxLength: v === 'TEXT' || v === 'TEXTAREA' ? field.maxLength ?? null : null,
                min: v === 'NUMBER' ? field.min ?? null : null,
                max: v === 'NUMBER' ? field.max ?? null : null,
                options: v === 'SELECT' || v === 'MULTISELECT' ? field.options ?? [] : null,
              })
            }
          >
            <SelectTrigger id={`type-${index}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FIELD_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={field.required}
            onCheckedChange={(checked) => onChange({ ...field, required: checked })}
          />
          必填
        </label>

        {showTextLength && (
          <div className="flex items-center gap-2 text-sm">
            <Label htmlFor={`maxLength-${index}`} className="text-sm">最大长度</Label>
            <Input
              id={`maxLength-${index}`}
              type="number"
              min={1}
              className="w-24"
              value={field.maxLength ?? ''}
              onChange={(e) =>
                onChange({ ...field, maxLength: e.target.value ? Number(e.target.value) : null })
              }
            />
          </div>
        )}

        {showNumberRange && (
          <>
            <div className="flex items-center gap-2 text-sm">
              <Label htmlFor={`min-${index}`} className="text-sm">min</Label>
              <Input
                id={`min-${index}`}
                type="number"
                className="w-24"
                value={field.min ?? ''}
                onChange={(e) =>
                  onChange({ ...field, min: e.target.value ? Number(e.target.value) : null })
                }
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Label htmlFor={`max-${index}`} className="text-sm">max</Label>
              <Input
                id={`max-${index}`}
                type="number"
                className="w-24"
                value={field.max ?? ''}
                onChange={(e) =>
                  onChange({ ...field, max: e.target.value ? Number(e.target.value) : null })
                }
              />
            </div>
          </>
        )}
      </div>

      {showOptions && (
        <div className="space-y-1.5">
          <Label htmlFor={`options-${index}`}>
            选项(每行一个,SELECT / MULTISELECT 必填)
          </Label>
          <textarea
            id={`options-${index}`}
            className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={optionsText}
            placeholder={'大一\n大二\n大三'}
            onChange={(e) =>
              onChange({
                ...field,
                options: e.target.value
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>
      )}
    </div>
  )
}