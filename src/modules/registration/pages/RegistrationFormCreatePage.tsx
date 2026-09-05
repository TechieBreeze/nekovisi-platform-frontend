import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import TemplatePickerDialog from '@/modules/registration/components/TemplatePickerDialog'
import { useCreateForm } from '@/modules/registration/hooks/useRegistrationForms'
import type { FieldTemplateListItem } from '@/modules/registration/types/registration'

/**
 * 创建报名表 — 走模板选 → 填 name/description → 提交 → 跳详情页。
 *
 * 流程:TemplatePickerDialog 选模板 → 表单填基本信息 → 提交(带模板的 fields)。
 */
export default function RegistrationFormCreatePage() {
  const navigate = useNavigate()
  const [pickerOpen, setPickerOpen] = useState(true)
  const [pickedTemplate, setPickedTemplate] = useState<FieldTemplateListItem | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const createMutation = useCreateForm()

  const handlePick = (tpl: FieldTemplateListItem) => {
    setPickedTemplate(tpl)
    setPickerOpen(false)
    setName((prev) => prev || tpl.name)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pickedTemplate || !name.trim()) return
    const newId = await createMutation.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
      fields: pickedTemplate.fields,
    })
    navigate(`/admin/registration-forms/${newId}`)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <header className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/registration-forms')}
        >
          <ArrowLeft className="size-4" />
          返回
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">新建报名表</h1>
      </header>

      {!pickedTemplate ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">第一步:选择字段模板</CardTitle>
            <CardDescription>
              模板决定字段定义。选完可在第二步修改字段 / 进入详情页继续调整。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setPickerOpen(true)}>选择模板</Button>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">第二步:基本信息</CardTitle>
              <CardDescription>
                字段模板:<strong>{pickedTemplate.name}</strong> · {pickedTemplate.fieldCount} 个字段
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  表单名称<span className="ml-0.5 text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  placeholder="例:2026 春季组队训练赛报名"
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">描述(可选)</Label>
                <Textarea
                  id="description"
                  value={description}
                  placeholder="表单用途说明"
                  rows={3}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/admin/registration-forms')}
              disabled={createMutation.isPending}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !name.trim()}
            >
              {createMutation.isPending ? '创建中…' : '创建并进入详情'}
            </Button>
          </div>
        </form>
      )}

      <TemplatePickerDialog
        open={pickerOpen}
        onClose={() => {
          if (!pickedTemplate) navigate('/admin/registration-forms')
          else setPickerOpen(false)
        }}
        onPick={handlePick}
      />
    </div>
  )
}