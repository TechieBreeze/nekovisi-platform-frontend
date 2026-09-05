import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { buildRecordSchema, recordPayload } from '@/modules/registration/schemas/recordSchema'
import type {
  FieldDef,
  RecordData,
  RecordListItem,
} from '@/modules/registration/types/registration'

interface RecordEditorDialogProps {
  open: boolean
  fields: FieldDef[]
  /** 传 undefined 表示新增,否则是编辑。 */
  record?: RecordListItem
  submitting?: boolean
  onClose: () => void
  onSubmit: (data: RecordData) => void | Promise<void>
}

/**
 * 报名记录编辑/新增对话框 — 字段定义是动态的,UI 也动态生成。
 *
 * 用 zod 的 recordSchema 现场校验每个字段;React Hook Form 管 dirty / submit。
 * passthrough 保证 stale data(改了字段定义)不会阻塞保存。
 */
export default function RecordEditorDialog({
  open,
  fields,
  record,
  submitting,
  onClose,
  onSubmit,
}: RecordEditorDialogProps) {
  const schema = buildRecordSchema(fields)
  const defaults = initialValues(fields, record?.data)

  const form = useForm<RecordData>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  })

  // 打开对话框 / 切换 record 时重置
  useEffect(() => {
    form.reset(defaults)
  }, [record?.id, open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleValid = form.handleSubmit(async (values) => {
    await onSubmit(recordPayload(values))
  })

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{record ? `编辑记录 #${record.id}` : '新增报名记录'}</DialogTitle>
          <DialogDescription>
            填字段后提交;后端会校验必填 + 类型 + 选项合法性。
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleValid} noValidate>
          {fields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={`f-${f.key}`}>
                {f.label}
                {f.required && <span className="ml-0.5 text-destructive">*</span>}
              </Label>

              <Controller
                control={form.control}
                name={f.key}
                render={({ field: rhfField, fieldState }) => {
                  if (f.type === 'SELECT') {
                    return (
                      <>
                        <Select
                          value={(rhfField.value as string | undefined) ?? ''}
                          onValueChange={rhfField.onChange}
                        >
                          <SelectTrigger id={`f-${f.key}`}>
                            <SelectValue placeholder="请选择" />
                          </SelectTrigger>
                          <SelectContent>
                            {(f.options ?? []).map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.error && (
                          <p className="text-xs text-destructive">{fieldState.error.message}</p>
                        )}
                      </>
                    )
                  }

                  if (f.type === 'MULTISELECT') {
                    const selected = (rhfField.value as string[] | undefined) ?? []
                    return (
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap gap-2">
                          {(f.options ?? []).map((opt) => {
                            const checked = selected.includes(opt)
                            return (
                              <label
                                key={opt}
                                className={[
                                  'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm cursor-pointer',
                                  checked
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-input hover:bg-muted',
                                ].join(' ')}
                              >
                                <input
                                  type="checkbox"
                                  className="size-3.5"
                                  checked={checked}
                                  onChange={(e) => {
                                    const next = e.target.checked
                                      ? [...selected, opt]
                                      : selected.filter((s) => s !== opt)
                                    rhfField.onChange(next)
                                  }}
                                />
                                {opt}
                              </label>
                            )
                          })}
                        </div>
                        {fieldState.error && (
                          <p className="text-xs text-destructive">{fieldState.error.message}</p>
                        )}
                      </div>
                    )
                  }

                  if (f.type === 'TEXTAREA') {
                    return (
                      <>
                        <textarea
                          id={`f-${f.key}`}
                          className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          value={(rhfField.value as string | undefined) ?? ''}
                          onChange={(e) => rhfField.onChange(e.target.value)}
                        />
                        {fieldState.error && (
                          <p className="text-xs text-destructive">{fieldState.error.message}</p>
                        )}
                      </>
                    )
                  }

                  if (f.type === 'DATE') {
                    return (
                      <>
                        <Input
                          id={`f-${f.key}`}
                          type="date"
                          value={(rhfField.value as string | undefined) ?? ''}
                          onChange={(e) => rhfField.onChange(e.target.value)}
                        />
                        {fieldState.error && (
                          <p className="text-xs text-destructive">{fieldState.error.message}</p>
                        )}
                      </>
                    )
                  }

                  // TEXT / NUMBER fallback
                  return (
                    <>
                      <Input
                        id={`f-${f.key}`}
                        type={f.type === 'NUMBER' ? 'number' : 'text'}
                        value={(rhfField.value as string | number | undefined) ?? ''}
                        onChange={(e) =>
                          rhfField.onChange(
                            f.type === 'NUMBER' && e.target.value !== ''
                              ? Number(e.target.value)
                              : e.target.value,
                          )
                        }
                      />
                      {fieldState.error && (
                        <p className="text-xs text-destructive">{fieldState.error.message}</p>
                      )}
                    </>
                  )
                }}
              />
            </div>
          ))}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
              取消
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? '提交中…' : record ? '保存修改' : '新增'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function initialValues(fields: FieldDef[], data?: RecordData): RecordData {
  const out: RecordData = {}
  for (const f of fields) {
    out[f.key] = (data?.[f.key] as string | number | string[] | undefined) ?? undefined
  }
  return out
}

// 仅为满足 ts isolatedModules
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _useStateShim() {
  const [s] = useState(0)
  return s
}