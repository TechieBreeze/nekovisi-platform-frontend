import { z } from 'zod'

/**
 * 报名表 / 字段定义 schema — 镜像后端 RecordValidator.validateFieldDefs。
 *
 * 后端约束:
 *   - name: @NotBlank, maxLength 200
 *   - fields: List<FieldDef>,非空,key 唯一且匹配 ^[a-zA-Z_][a-zA-Z0-9_]*$
 *   - SELECT/MULTISELECT 必须有 options(至少 1 项)
 *   - NUMBER 的 min/max 可选,但若都有须满足 min <= max
 *   - TEXT/TEXTAREA 的 maxLength 必须 >= 1(若有)
 */

const fieldTypeSchema = z.enum(['TEXT', 'TEXTAREA', 'NUMBER', 'SELECT', 'MULTISELECT', 'DATE'])

const fieldDefSchema = z
  .object({
    key: z
      .string()
      .min(1, 'key 不能为空')
      .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'key 必须以字母/下划线开头,只能含字母数字下划线'),
    label: z.string().min(1, 'label 不能为空').max(50, 'label 不超过 50 字'),
    type: fieldTypeSchema,
    required: z.boolean(),
    maxLength: z.number().int().positive('maxLength 必须 > 0').nullable().optional(),
    min: z.number().nullable().optional(),
    max: z.number().nullable().optional(),
    options: z.array(z.string().min(1)).nullable().optional(),
  })
  .superRefine((f, ctx) => {
    // SELECT / MULTISELECT:必须有 options 数组
    if ((f.type === 'SELECT' || f.type === 'MULTISELECT') && (!f.options || f.options.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'SELECT/MULTISELECT 必须配置 options',
        path: ['options'],
      })
    }
    // NUMBER:若 min/max 都给了,min 必须 <= max
    if (f.type === 'NUMBER' && f.min != null && f.max != null && f.min > f.max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'min 必须 ≤ max',
        path: ['max'],
      })
    }
  })

export const createFormSchema = z.object({
  name: z.string().min(1, '请输入表单名称').max(200, '名称不超过 200 字'),
  description: z.string().max(1000, '描述不超过 1000 字').optional().or(z.literal('')),
  fields: z
    .array(fieldDefSchema)
    .min(1, '至少配置一个字段')
    .superRefine((arr, _ctx) => {
      // key 重复检查 — Set 大小 != 数组长就有重复
      const keys = arr.map((f) => f.key)
      if (new Set(keys).size !== keys.length) {
        _ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '字段 key 不能重复',
        })
      }
    }),
})

export type CreateFormFormValues = z.infer<typeof createFormSchema>

/** updateFormSchema 是 createFormSchema 的字段全可选版本。 */
export const updateFormSchema = createFormSchema.partial()

export type UpdateFormFormValues = z.infer<typeof updateFormSchema>

/** CreateFormFormValues → 后端 CreateFormRequest(把空描述转 undefined)。 */
export function createFormPayload(values: CreateFormFormValues): {
  name: string
  description?: string
  fields: CreateFormFormValues['fields']
} {
  return {
    name: values.name.trim(),
    description: values.description?.trim() || undefined,
    fields: values.fields,
  }
}

export function updateFormPayload(values: UpdateFormFormValues): {
  name?: string
  description?: string
  fields?: UpdateFormFormValues['fields']
} {
  return {
    name: values.name?.trim(),
    description: values.description?.trim() || undefined,
    fields: values.fields,
  }
}

/** 导出 fieldDefSchema 单独给测试和编辑器复用(动态校验单条字段)。 */
export { fieldDefSchema }