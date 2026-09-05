import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * DurationField — 把"小时 + 分钟"两个 Number 输入合成 ISO-8601 duration。
 *
 * 行为:
 *   - 外部通过 value={{hours, minutes}} / onChange 控制
 *   - clamp:分钟 < 0 或 > 59 自动截断到边界;小时同理
 *   - 显示:并排两个 80px 宽输入 + 后缀"小时"/"分钟"
 *
 * 不在这里做校验;校验交给 zod schema(创建表单里)。
 */

interface DurationValue {
  hours: number
  minutes: number
}

interface DurationFieldProps {
  id: string
  label?: string
  value: DurationValue
  onChange: (next: DurationValue) => void
  required?: boolean
  disabled?: boolean
}

export default function DurationField({
  id,
  label,
  value,
  onChange,
  required,
  disabled,
}: DurationFieldProps) {
  const handleHours = (raw: string) => {
    const n = Number.parseInt(raw, 10)
    const safe = Number.isFinite(n) ? Math.max(0, Math.min(168, n)) : 0
    onChange({ ...value, hours: safe })
  }
  const handleMinutes = (raw: string) => {
    const n = Number.parseInt(raw, 10)
    const safe = Number.isFinite(n) ? Math.max(0, Math.min(59, n)) : 0
    onChange({ ...value, minutes: safe })
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
      )}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <Input
            id={id}
            type="number"
            inputMode="numeric"
            min={0}
            max={168}
            step={1}
            value={value.hours}
            onChange={(e) => handleHours(e.target.value)}
            disabled={disabled}
            className="w-20"
            aria-label="小时"
          />
          <span className="text-sm text-muted-foreground">小时</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            max={59}
            step={1}
            value={value.minutes}
            onChange={(e) => handleMinutes(e.target.value)}
            disabled={disabled}
            className="w-20"
            aria-label="分钟"
          />
          <span className="text-sm text-muted-foreground">分钟</span>
        </div>
      </div>
    </div>
  )
}
