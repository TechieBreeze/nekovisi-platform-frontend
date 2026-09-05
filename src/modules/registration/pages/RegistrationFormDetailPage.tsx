import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Save } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import FormHeader from '@/modules/registration/components/FormHeader'
import FieldDefEditor from '@/modules/registration/components/FieldDefEditor'
import RecordGridTable from '@/modules/registration/components/RecordGridTable'
import RecordEditorDialog from '@/modules/registration/components/RecordEditorDialog'
import {
  useDeleteForm,
  useFormDetail,
  useUpdateForm,
} from '@/modules/registration/hooks/useRegistrationForms'
import {
  useAddRecord,
  useDeleteRecord,
  useRecordList,
  useUpdateRecord,
} from '@/modules/registration/hooks/useRegistrationRecords'
import type {
  FieldDef,
  RecordData,
  RecordListItem,
} from '@/modules/registration/types/registration'

/**
 * 报名表详情页 — 单页 3 卡片:
 *   1. FormHeader(名字 / 描述 / 元数据 + 编辑 / 删除按钮)
 *   2. 字段定义卡(FieldDefEditor + 保存按钮)
 *   3. 报名记录卡(RecordGridTable + 新增 / 编辑 / 删除)
 */
export default function RegistrationFormDetailPage() {
  const { id: idStr } = useParams<{ id: string }>()
  const id = Number(idStr)
  const navigate = useNavigate()

  const { data: form, isLoading: formLoading, isError: formError, error: formErr } =
    useFormDetail(Number.isFinite(id) ? id : undefined)
  const updateMutation = useUpdateForm(id)
  const deleteMutation = useDeleteForm()

  // ===== 表单头 inline 编辑态 =====
  const [headerEditing, setNameEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [toDeleteForm, setToDeleteForm] = useState(false)

  useEffect(() => {
    if (form) {
      setEditName(form.name)
      setEditDesc(form.description)
    }
  }, [form?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const startHeaderEdit = () => {
    if (!form) return
    setEditName(form.name)
    setEditDesc(form.description)
    setNameEditing(true)
  }

  const saveHeader = async () => {
    await updateMutation.mutateAsync({
      name: editName.trim() || form?.name,
      description: editDesc.trim(),
    })
    setNameEditing(false)
  }

  const handleDeleteForm = async () => {
    if (!form) return
    await deleteMutation.mutateAsync(form.id)
    navigate('/admin/registration-forms')
  }

  // ===== 字段定义 dirty 状态 =====
  const [fields, setFields] = useState<FieldDef[]>([])
  const [fieldsDirty, setFieldsDirty] = useState(false)
  const [fieldKeyErrors, setFieldKeyErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (form) {
      setFields(form.fields)
      setFieldsDirty(false)
      setFieldKeyErrors({})
    }
  }, [form?.id, form?.fields]) // eslint-disable-line react-hooks/exhaustive-deps

  const validateFields = (next: FieldDef[]): Record<string, string> => {
    const errors: Record<string, string> = {}
    const seen = new Set<string>()
    for (const f of next) {
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(f.key)) {
        errors[f.key] = 'key 不合法'
      } else if (seen.has(f.key)) {
        errors[f.key] = 'key 重复'
      } else {
        seen.add(f.key)
      }
      if ((f.type === 'SELECT' || f.type === 'MULTISELECT') && (!f.options || f.options.length === 0)) {
        errors[f.key] = 'SELECT/MULTISELECT 缺 options'
      }
      if (f.type === 'NUMBER' && f.min != null && f.max != null && f.min > f.max) {
        errors[f.key] = 'min 必须 ≤ max'
      }
    }
    return errors
  }

  const handleFieldsChange = (next: FieldDef[]) => {
    setFields(next)
    setFieldsDirty(true)
    setFieldKeyErrors(validateFields(next))
  }

  const saveFields = async () => {
    const errors = validateFields(fields)
    if (Object.keys(errors).length > 0) {
      setFieldKeyErrors(errors)
      toast.error('字段定义不合法,无法保存')
      return
    }
    await updateMutation.mutateAsync({ fields })
    setFieldsDirty(false)
  }

  // ===== 记录 grid =====
  const { data: records, isLoading: recordsLoading } = useRecordList(id, { page: 1, size: 50 })
  const addMutation = useAddRecord(id)
  const updateRecordMutation = useUpdateRecord(id)
  const deleteRecordMutation = useDeleteRecord(id)

  const [editorOpen, setEditorOpen] = useState(false)
  const [editingRec, setEditingRec] = useState<RecordListItem | undefined>(undefined)
  const [toDeleteRecord, setToDeleteRecord] = useState<RecordListItem | null>(null)

  const handleAddRecord = async (data: RecordData) => {
    await addMutation.mutateAsync({ data, source: 'manual' })
    setEditorOpen(false)
  }

  const handleUpdateRecord = async (data: RecordData) => {
    if (!editingRec) return
    await updateRecordMutation.mutateAsync({ recordId: editingRec.id, req: { data, source: editingRec.source } })
    setEditorOpen(false)
    setEditingRec(undefined)
  }

  const handleDeleteRecord = async () => {
    if (!toDeleteRecord) return
    await deleteRecordMutation.mutateAsync(toDeleteRecord.id)
    setToDeleteRecord(null)
  }

  const keyErrorView = useMemo(() => fieldKeyErrors, [fieldKeyErrors])

  if (formLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (formError || !form) {
    return (
      <div className="surface-card mx-auto max-w-4xl p-8 text-center">
        <p className="text-sm text-destructive">加载表单失败:{String(formErr)}</p>
        <Button variant="outline" className="mt-3" onClick={() => navigate('/admin/registration-forms')}>
          返回列表
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <FormHeader
        form={form}
        editing={headerEditing}
        editName={editName}
        editDescription={editDesc}
        onStartEdit={startHeaderEdit}
        onChangeName={setEditName}
        onChangeDescription={setEditDesc}
        onCancelEdit={() => setNameEditing(false)}
        onSaveEdit={saveHeader}
        saving={updateMutation.isPending}
        onDelete={() => setToDeleteForm(true)}
      />

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">字段定义</CardTitle>
            <CardDescription>改完点保存,字段变更后已存在的旧记录保留兼容。</CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={!fieldsDirty || Object.keys(keyErrorView).length > 0}
            onClick={saveFields}
          >
            <Save className="size-3.5" />
            {updateMutation.isPending ? '保存中…' : '保存字段'}
          </Button>
        </CardHeader>
        <CardContent>
          <FieldDefEditor fields={fields} onChange={handleFieldsChange} keyErrors={keyErrorView} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">报名记录</CardTitle>
            <CardDescription>共 {records?.total ?? 0} 条</CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setEditingRec(undefined)
              setEditorOpen(true)
            }}
          >
            <Plus className="size-3.5" />
            新增记录
          </Button>
        </CardHeader>
        <CardContent>
          <RecordGridTable
            fields={form.fields}
            items={records?.items ?? []}
            loading={recordsLoading}
            onEdit={(r) => {
              setEditingRec(r)
              setEditorOpen(true)
            }}
            onDelete={(r) => setToDeleteRecord(r)}
          />
        </CardContent>
      </Card>

      <RecordEditorDialog
        open={editorOpen}
        fields={fields}
        record={editingRec}
        submitting={addMutation.isPending || updateRecordMutation.isPending}
        onClose={() => {
          setEditorOpen(false)
          setEditingRec(undefined)
        }}
        onSubmit={editingRec ? handleUpdateRecord : handleAddRecord}
      />

      <AlertDialog open={toDeleteForm} onOpenChange={(o) => !o && setToDeleteForm(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除表单?</AlertDialogTitle>
            <AlertDialogDescription>
              将删除表单 <strong>{form.name}</strong> 及其全部 {form.recordCount} 条记录。
              此操作不可恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>取消</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={handleDeleteForm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? '删除中…' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={toDeleteRecord !== null}
        onOpenChange={(o) => !o && setToDeleteRecord(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除记录?</AlertDialogTitle>
            <AlertDialogDescription>
              记录 #{toDeleteRecord?.id} 会被永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteRecordMutation.isPending}>取消</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteRecordMutation.isPending}
              onClick={handleDeleteRecord}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRecordMutation.isPending ? '删除中…' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}