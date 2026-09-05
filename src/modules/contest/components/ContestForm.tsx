import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import DurationField from '@/modules/contest/components/DurationField'
import {
  createContestSchema,
  createContestPayload,
  type CreateContestFormValues,
} from '@/modules/contest/schemas/contestSchema'
import { durationToHoursMinutes } from '@/shared/utils/duration'
import {
  fromDateTimeLocalInput,
  toDateTimeLocalInput,
} from '@/shared/utils/datetime'

/**
 * 赛事表单(创建/编辑共用)。
 *
 * 通过 `initial` 控制模式:
 *   - 不传 → 创建,默认值:开始时间 = 现在 + 1 天,时长 5h
 *   - 传入 ContestEntity → 编辑,字段从 entity 推导
 *
 * 提交流程:
 *   onValid → onSubmit(payload) → 由父级组件接 TanStack Query mutation
 */
interface ContestFormProps {
  initial?: {
    name: string
    startTime: string
    durationSeconds: number
    freezeDurationSeconds: number | null
    prefix: string | null
    passwordLength: number | null
    penaltyTime: number | null
    isPublic: boolean
  }
  submitting?: boolean
  onSubmit: (payload: ReturnType<typeof createContestPayload>) => void | Promise<void>
  onCancel: () => void
}

const DEFAULTS: CreateContestFormValues = {
  name: '',
  startTime: '',
  duration: { hours: 5, minutes: 0 },
  freezeDuration: undefined,
  prefix: '',
  passwordLength: 8,
  penaltyTime: 20,
  isPublic: false,
}

export default function ContestForm({ initial, submitting, onSubmit, onCancel }: ContestFormProps) {
  const navigate = useNavigate()

  const form = useForm<CreateContestFormValues>({
    resolver: zodResolver(createContestSchema),
    defaultValues: DEFAULTS,
  })

  // 初始化 / 重置:用 initial 覆盖默认值
  useEffect(() => {
    if (initial) {
      form.reset({
        name: initial.name,
        startTime: toDateTimeLocalInput(initial.startTime),
        duration: durationToHoursMinutes(initial.durationSeconds),
        freezeDuration: initial.freezeDurationSeconds
          ? durationToHoursMinutes(initial.freezeDurationSeconds)
          : undefined,
        prefix: initial.prefix ?? '',
        passwordLength: initial.passwordLength ?? 8,
        penaltyTime: initial.penaltyTime ?? 20,
        isPublic: initial.isPublic,
      })
    } else {
      // 创建模式:开始时间默认 = 现在 + 1 天
      const oneDayLater = new Date(Date.now() + 24 * 60 * 60 * 1000)
      form.reset({
        ...DEFAULTS,
        startTime: toDateTimeLocalInput(oneDayLater.toISOString() as unknown as string),
      })
    }
  }, [initial, form])

  const handleValid = form.handleSubmit(async (values) => {
    // startTime 是 datetime-local,转 ISO 带 offset
    const startTimeIso = fromDateTimeLocalInput(values.startTime)
    const payload = createContestPayload({
      ...values,
      startTime: startTimeIso,
    })
    await onSubmit(payload)
  })

  return (
    <form className="space-y-6" onSubmit={handleValid} noValidate>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">
              赛事名称<span className="ml-0.5 text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="例:2026 春季组队训练赛"
              aria-invalid={Boolean(form.formState.errors.name)}
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="startTime">
                开始时间<span className="ml-0.5 text-destructive">*</span>
              </Label>
              <Input
                id="startTime"
                type="datetime-local"
                aria-invalid={Boolean(form.formState.errors.startTime)}
                {...form.register('startTime')}
              />
              {form.formState.errors.startTime && (
                <p className="text-xs text-destructive">{form.formState.errors.startTime.message}</p>
              )}
            </div>

            <Controller
              control={form.control}
              name="duration"
              render={({ field, fieldState }) => (
                <div className="space-y-1.5">
                  <DurationField
                    id="duration"
                    label="比赛时长"
                    value={field.value}
                    onChange={field.onChange}
                    required
                  />
                  {fieldState.error && (
                    <p className="text-xs text-destructive">{fieldState.error.message}</p>
                  )}
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="freezeDuration"
              render={({ field }) => (
                <DurationField
                  id="freezeDuration"
                  label="封榜时长(可选)"
                  value={field.value ?? { hours: 0, minutes: 0 }}
                  onChange={(v) =>
                    field.onChange(v.hours === 0 && v.minutes === 0 ? undefined : v)
                  }
                />
              )}
            />

            <div className="space-y-1.5">
              <Label htmlFor="prefix">前缀(可选)</Label>
              <Input
                id="prefix"
                placeholder="例:acm26"
                maxLength={20}
                {...form.register('prefix')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="passwordLength">密码长度</Label>
              <Input
                id="passwordLength"
                type="number"
                min={4}
                max={32}
                {...form.register('passwordLength', { valueAsNumber: true })}
              />
              {form.formState.errors.passwordLength && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.passwordLength.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="penaltyTime">罚时(分钟)</Label>
              <Input
                id="penaltyTime"
                type="number"
                min={0}
                max={600}
                {...form.register('penaltyTime', { valueAsNumber: true })}
              />
              {form.formState.errors.penaltyTime && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.penaltyTime.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">可见性</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <label className="flex items-center gap-3">
                <Switch checked={field.value} onCheckedChange={field.onChange} />
                <span className="text-sm">
                  公开赛事
                  <span className="ml-2 text-xs text-muted-foreground">
                    公开后会在 Portal 列表展示,无需登录即可查看基本信息
                  </span>
                </span>
              </label>
            )}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel || (() => navigate(-1))} disabled={submitting}>
          取消
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? '提交中…' : initial ? '保存修改' : '创建赛事'}
        </Button>
      </div>
    </form>
  )
}
