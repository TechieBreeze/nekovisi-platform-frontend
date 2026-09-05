import { z } from 'zod'

import type { FieldDef, RecordData } from '@/modules/registration/types/registration'

/**
 * 动态 record zod schema — 关键设计点(见 ADR 0007 + troubleshooting/2026-09-05-registration-dynamic-zod-schema):
 *   1. 字段定义是动态的,不能写死 z.object({ team_name: ..., age: ... })。
 *   2. 改 zod 字段名必须重构,所以用 builder 函数按 fields 现场生成。
 *   3. 数据值可能是 string / number / string[],由 type 决定怎么校验。
 *   4. 用 .passthrough() 接受未知 key — 字段定义可能改了但旧记录还在,前端不阻塞保存。
 */

/**
 * 根据字段定义数组生成 record 提交用的 zod schema。
 *
 * 行为:
 *   - 必填字段:必填,空字符串也算缺
 *   - TEXT/TEXTAREA:maxLength 校验
 *   - NUMBER:解析字符串数字 + min/max 校验
 *   - SELECT:值必须在 options 里
 *   - MULTISELECT:每个值必须在 options 里
 *   - DATE:匹配 YYYY-MM-DD 前缀
 *   - 非必填字段:optional
 *   - 未知 key:passthrough 放行(允许 stale data 保存)
 */
export function buildRecordSchema(fields: FieldDef[]): z.ZodType<RecordData> {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const f of fields) {
    let base: z.ZodTypeAny

    switch (f.type) {
      case 'TEXT':
      case 'TEXTAREA': {
        let s = z.string({ invalid_type_error: `${f.label} 必须是文本` })
        if (f.maxLength) {
          s = s.max(f.maxLength, `${f.label} 长度超过 ${f.maxLength}`)
        }
        base = s
        break
      }
      case 'NUMBER': {
        // 接受字符串数字,与后端 RecordValidator 一致;z.preprocess 先把字符串转 number
        let n = z.number({ invalid_type_error: `${f.label} 必须是数字` })
        if (f.min != null) n = n.min(f.min, `${f.label} 不能小于 ${f.min}`)
        if (f.max != null) n = n.max(f.max, `${f.label} 不能大于 ${f.max}`)
        base = z.preprocess(
          (v) => (typeof v === 'string' && v !== '' ? Number(v) : v),
          n,
        )
        break
      }
      case 'SELECT': {
        const opts = f.options ?? []
        base = z
          .string()
          .refine((v) => opts.includes(v), { message: `${f.label} 必须是有效选项` })
        break
      }
      case 'MULTISELECT': {
        const opts = f.options ?? []
        base = z
          .array(z.string())
          .refine((arr) => arr.every((v) => opts.includes(v)), {
            message: `${f.label} 含无效选项`,
          })
        break
      }
      case 'DATE': {
        base = z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}/, `${f.label} 日期格式应为 YYYY-MM-DD`)
        break
      }
      default: {
        // 未知类型(防御):fallback 到 string
        base = z.string()
      }
    }

    shape[f.key] = f.required ? base : base.optional()
  }

  // passthrough:允许未知 key 通过(向后兼容字段定义变化)
  return z.object(shape).passthrough() as unknown as z.ZodType<RecordData>
}

/** RecordData → 后端提交 payload(过滤掉 undefined 字段)。 */
export function recordPayload(data: RecordData): RecordData {
  const out: RecordData = {}
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) out[k] = v
  }
  return out
}