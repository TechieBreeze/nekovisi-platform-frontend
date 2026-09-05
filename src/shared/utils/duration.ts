/**
 * Duration 工具 — ISO-8601 ↔ seconds 双向转换
 *
 * 后端约定:Duration 字段统一存 `Long seconds`,DTO 上是 ISO-8601 字符串(如 `PT5H` / `PT1H30M`)。
 * 前端表单用"小时 + 分钟"两个 Number 输入更直观,所以这里提供:
 *   - `parseDuration("PT5H")` → 18000
 *   - `formatDuration(18000)` → "PT5H"
 *   - `durationToHoursMinutes(seconds)` → { hours, minutes } 用于表单预填
 *   - `hoursMinutesToDuration({hours:1, minutes:30})` → "PT1H30M" 用于提交
 *
 * 后端用 `java.time.Duration.parse` 校验,所以生成的字符串必须能被它解析。
 * 这里只支持 0、正整数、负整数的小时/分钟(够 MVP 用)。日/秒/毫秒不强求。
 */

const ISO_RE = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/

/**
 * 把 ISO-8601 duration 字符串解析成秒数。
 * 无法解析时抛 Error(让调用方决定是吞还是显示给用户)。
 *
 * @example
 *   parseDuration("PT5H")          // 18000
 *   parseDuration("PT1H30M")       // 5400
 *   parseDuration("P1DT2H")        // 93600
 *   parseDuration("PT0S")          // 0
 *   parseDuration("bad")           // throw Error
 */
export function parseDuration(input: string): number {
  const trimmed = input.trim()
  if (trimmed === 'PT0S' || trimmed === 'P0D' || trimmed === 'P0DT0S') return 0
  const match = ISO_RE.exec(trimmed)
  if (!match) {
    throw new Error(`Invalid ISO-8601 duration: ${input}`)
  }
  const [, days = '0', hours = '0', minutes = '0', seconds = '0'] = match
  const total =
    Number(days) * 86400 +
    Number(hours) * 3600 +
    Number(minutes) * 60 +
    Number(seconds)
  return total
}

/**
 * 把秒数格式化成 ISO-8601 duration 字符串,后端可 parse。
 * 0 秒统一输出 `PT0S`(后端 ok)。
 *
 * @example
 *   formatDuration(18000)  // "PT5H"
 *   formatDuration(5400)   // "PT1H30M"
 *   formatDuration(0)      // "PT0S"
 */
export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    throw new Error(`Duration must be a non-negative finite number, got: ${totalSeconds}`)
  }
  if (totalSeconds === 0) return 'PT0S'

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  let out = 'PT'
  if (hours > 0) out += `${hours}H`
  if (minutes > 0) out += `${minutes}M`
  if (hours === 0 && minutes === 0) out += `${seconds}S`
  return out
}

/**
 * 把秒数拆成"小时 + 分钟",用于表单两个 Number 输入框预填。
 * 余下的秒数归到分钟(向上取整),避免出现 PT4H59M59S 这种用户困惑的形式。
 */
export function durationToHoursMinutes(totalSeconds: number): {
  hours: number
  minutes: number
} {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return { hours: 0, minutes: 0 }
  }
  const hours = Math.floor(totalSeconds / 3600)
  const remainingAfterHours = totalSeconds - hours * 3600
  const minutes = Math.ceil(remainingAfterHours / 60)
  // 处理边界:60 分钟 → 1 小时 0 分,避免出 PT1H60M
  if (minutes === 60) return { hours: hours + 1, minutes: 0 }
  return { hours, minutes }
}

/**
 * 表单输入 → ISO-8601 字符串。
 * 当 hours 和 minutes 都为 0 时输出 `PT0S`,后端校验通过。
 */
export function hoursMinutesToDuration(input: {
  hours: number
  minutes: number
}): string {
  const h = Math.max(0, Math.floor(input.hours ?? 0))
  const m = Math.max(0, Math.floor(input.minutes ?? 0))
  return formatDuration(h * 3600 + m * 60)
}

/**
 * 把秒数格式化成"Xh Ym"展示文案,中文友好。
 *   formatDurationHuman(18000)  // "5h"
 *   formatDurationHuman(5400)   // "1h 30m"
 *   formatDurationHuman(0)      // "0m"
 */
export function formatDurationHuman(totalSeconds: number): string {
  const { hours, minutes } = durationToHoursMinutes(totalSeconds)
  const parts: string[] = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0 || hours === 0) parts.push(`${minutes}m`)
  return parts.join(' ')
}
