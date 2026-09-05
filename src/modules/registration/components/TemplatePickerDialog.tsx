import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { useTemplateList } from '@/modules/registration/hooks/useFieldTemplates'
import type {
  FieldDef,
  FieldTemplateListItem,
} from '@/modules/registration/types/registration'

interface TemplatePickerDialogProps {
  open: boolean
  onClose: () => void
  onPick: (template: FieldTemplateListItem) => void
}

/**
 * 模板选择对话框 — 创建表单第一步。
 *
 * 列内置 + 自定义模板,用户点选后把模板的 fields 传回去;
 * 父级(创建页)再让用户输 name / description,最终调 createForm。
 */
export default function TemplatePickerDialog({ open, onClose, onPick }: TemplatePickerDialogProps) {
  const { data, isLoading } = useTemplateList()
  const [pickedId, setPickedId] = useState<number | null>(null)

  useEffect(() => {
    if (!open) setPickedId(null)
  }, [open])

  const picked = data?.find((t) => t.id === pickedId) ?? null

  const handleConfirm = () => {
    if (picked) onPick(picked)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>选择字段模板</DialogTitle>
          <DialogDescription>
            内置模板包含常用字段集;自定义模板可继续编辑。选择后仍可在下一步修改字段。
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {(data ?? []).map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setPickedId(tpl.id)}
                className={[
                  'rounded-md border p-4 text-left transition-colors',
                  pickedId === tpl.id
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-input hover:bg-muted',
                ].join(' ')}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{tpl.name}</span>
                  {tpl.isBuiltin && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      内置
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {tpl.fieldCount} 个字段:{summarizeFields(tpl.fields)}
                </p>
              </button>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!picked}>
            下一步
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function summarizeFields(fields: FieldDef[]): string {
  return fields.slice(0, 4).map((f) => f.label).join(' · ') + (fields.length > 4 ? ' …' : '')
}