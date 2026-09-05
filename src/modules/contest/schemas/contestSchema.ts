import { z } from 'zod'

/**
 * 赛事表单校验 — 镜像后端 @Valid 注解。
 *
 * 后端约束:
 *   - name: @NotBlank
 *   - startTime: @NotNull (OffsetDateTime)
 *   - duration: @NotNull (ISO-8601 string, java.time.Duration.parse)
 *   - passwordLength: @Min(4)
 *   - penaltyTime: @Min(0)
 *   - 其余可选
 *
 * 表单的 duration 在 UI 上拆成"小时 + 分钟"两个 Number 字段,
 * 提交前在 transform 里合成 ISO-8601 字符串。
 */

const hoursMinutesSchema = z.object({
  hours: z.number().int().min(0).max(168), // 上限 7 天,挡住恶意输入
  minutes: z.number().int().min(0).max(59),
})

export const createContestSchema = z.object({
  name: z.string().min(1, '请输入赛事名称').max(200, '名称过长'),
  startTime: z.string().min(1, '请选择开始时间'),
  duration: hoursMinutesSchema,
  freezeDuration: hoursMinutesSchema.optional(),
  prefix: z.string().max(20, '前缀过长').optional().or(z.literal('')),
  passwordLength: z.number().int().min(4, '至少 4 位').max(32, '不超过 32 位'),
  penaltyTime: z.number().int().min(0, '不能为负').max(600, '不超过 600 分钟'),
  isPublic: z.boolean(),
})

export type CreateContestFormValues = z.infer<typeof createContestSchema>

/**
 * 把表单值转成后端 CreateContestRequest:
 *   - duration {hours, minutes} → "PT{h}H{m}M" 字符串
 *   - 空字段置 undefined,符合后端 Optional 语义
 */
export function createContestPayload(values: CreateContestFormValues) {
  return {
    name: values.name.trim(),
    startTime: values.startTime,
    duration: durationToIso(values.duration),
    freezeDuration: values.freezeDuration ? durationToIso(values.freezeDuration) : undefined,
    prefix: values.prefix?.trim() || undefined,
    passwordLength: values.passwordLength,
    penaltyTime: values.penaltyTime,
    isPublic: values.isPublic,
  }
}

export const updateContestSchema = createContestSchema
export type UpdateContestFormValues = CreateContestFormValues

export function updateContestPayload(values: UpdateContestFormValues) {
  return createContestPayload(values)
}

/**
 * { hours, minutes } → ISO-8601 duration 字符串
 *
 * 拆出去给 DurationField 复用。统一从 duration.ts 里走,避免在表单层
 * 直接调 formatDuration,把语义边界划在"工具"和"业务"之间。
 */
function durationToIso(d: { hours: number; minutes: number }): string {
  const totalSeconds = d.hours * 3600 + d.minutes * 60
  if (totalSeconds === 0) return 'PT0S'
  let out = 'PT'
  if (d.hours > 0) out += `${d.hours}H`
  if (d.minutes > 0) out += `${d.minutes}M`
  if (d.hours === 0 && d.minutes === 0) out += '0S'
  return out
}
