/**
 * 日期时间工具 — 围绕 dayjs,处理后端 OffsetDateTime 与前端表单的转换。
 *
 * 后端用 `java.time.OffsetDateTime` 序列化,Jackson 默认输出形如
 * `"2026-09-05T10:00:00+08:00"`(带时区偏移)。
 *
 * 前端表单 `<input type="datetime-local">` 不支持时区偏移,只接受
 * `"YYYY-MM-DDTHH:mm"`。所以这里提供:
 *   - `formatDateTime(iso)`           → "2026-09-05 10:00"
 *   - `toDateTimeLocalInput(iso)`     → "2026-09-05T10:00"
 *   - `fromDateTimeLocalInput(input)` → "2026-09-05T10:00:00+08:00"(本机时区偏移)
 *
 * 注意:datetime-local 输入一律按**浏览器本地时区**解释。
 * 集训队赛事时间一般挂在 UTC+8(北京时间),如果用户改时区会偏移;
 * 后续若做"用户指定时区"功能再扩展。
 */

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

const DEFAULT_TZ = 'Asia/Shanghai'

/** 把后端 ISO-8601 字符串格式化成"YYYY-MM-DD HH:mm"(UTC+8 显示)。 */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  return dayjs(iso).tz(DEFAULT_TZ).format('YYYY-MM-DD HH:mm')
}

/** 表格 / 列表行用"MM-DD HH:mm"(省年,紧凑)。 */
export function formatDateTimeShort(iso: string | null | undefined): string {
  if (!iso) return '—'
  return dayjs(iso).tz(DEFAULT_TZ).format('MM-DD HH:mm')
}

/** 给 `<input type="datetime-local">` 预填,丢掉秒和时区。 */
export function toDateTimeLocalInput(iso: string | null | undefined): string {
  if (!iso) return ''
  return dayjs(iso).tz(DEFAULT_TZ).format('YYYY-MM-DDTHH:mm')
}

/**
 * 从 `<input type="datetime-local">` 拿到 `YYYY-MM-DDTHH:mm`,
 * 补 `:00` 秒和本机时区偏移,转成后端能 parse 的 ISO-8601。
 */
export function fromDateTimeLocalInput(value: string): string {
  if (!value) return ''
  // 用本机时区构造 dayjs 对象,再 format 成带 offset 的 ISO
  const parsed = dayjs.tz(value, DEFAULT_TZ)
  if (!parsed.isValid()) {
    throw new Error(`Invalid datetime-local input: ${value}`)
  }
  return parsed.format() // e.g. "2026-09-05T10:00:00+08:00"
}

/**
 * 当前时间(本机时区)的 ISO-8601,用于"默认开始时间 = 当前 + 1 天"这种场景。
 */
export function nowIso(): string {
  return dayjs().tz(DEFAULT_TZ).format()
}
