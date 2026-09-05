/**
 * 赛事模块类型 — 1:1 镜像后端 `modules/contest/**`。
 *
 * 后端关键约定:
 *   - Duration 字段统一存 `Long seconds`,DTO 用 ISO-8601 字符串(`PT5H`)
 *   - JSONB 字段(medalConfigJson / exportFieldsJson)存**原始 JSON 字符串**,前端按需 JSON.parse
 *   - 状态机 7 态:PLANNING → READY → RUNNING → FROZEN → ENDED → ARCHIVING → ARCHIVED
 *   - 状态机非法转移后端会抛 INVALID_STATE_TRANSITION + 409,前端预校验能减少 409 次数
 *   - 分页 page 从 1 开始,size 默认 20,clamp 到 [1, 100]
 */

/** 后端 7 态枚举 — 字符串字面量联合(非 TS enum,更好做 type narrowing)。 */
export type ContestStatus =
  | 'PLANNING'
  | 'READY'
  | 'RUNNING'
  | 'FROZEN'
  | 'ENDED'
  | 'ARCHIVING'
  | 'ARCHIVED'

/** 状态机的合法转移规则 — 前端复刻,见 `canTransitTo`。 */
const TRANSITIONS: Record<ContestStatus, readonly ContestStatus[]> = {
  PLANNING: ['READY'],
  READY: ['RUNNING'],
  RUNNING: ['FROZEN', 'ENDED'],
  FROZEN: ['ENDED'],
  ENDED: ['ARCHIVING'],
  ARCHIVING: ['ARCHIVED'],
  ARCHIVED: [],
}

/**
 * 是否允许 `from` → `to`。前后端规则一致,违反后端会抛 INVALID_STATE_TRANSITION。
 *
 * 用法:
 *   if (canTransitTo(currentStatus, nextStatus)) { ... }
 */
export function canTransitTo(from: ContestStatus, to: ContestStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false
}

/** 给某个状态算出所有可达的下一态,用于状态机按钮组。 */
export function nextStatesOf(from: ContestStatus): readonly ContestStatus[] {
  return TRANSITIONS[from] ?? []
}

/** 列表项 — 镜像 `ContestListItem.java`。 */
export interface ContestListItem {
  id: number
  name: string
  startTime: string // ISO-8601 with offset, e.g. "2026-09-05T10:00:00+08:00"
  durationSeconds: number
  status: ContestStatus
  isPublic: boolean
  createdAt: string
}

/** 详情 — 镜像 `ContestEntity.java`。JSONB 字段保持原始字符串,详情页按需 parse。 */
export interface ContestEntity {
  id: number
  name: string
  startTime: string
  durationSeconds: number
  freezeDurationSeconds: number | null
  warmupStartTime: string | null
  warmupDurationSeconds: number | null
  prefix: string | null
  passwordLength: number | null
  penaltyTime: number | null
  isPublic: boolean
  registrationFormId: number | null
  medalConfigJson: string | null
  exportFieldsJson: string | null
  status: ContestStatus
  createdBy: number
  createdAt: string
  updatedAt: string
  deleted: boolean
}

/** 创建请求 — 镜像 `CreateContestRequest.java`。
 *  duration / freezeDuration / warmupDuration 用 ISO-8601 字符串(后端 Duration.parse)。 */
export interface CreateContestRequest {
  name: string
  startTime: string
  duration: string // ISO-8601, e.g. "PT5H"
  freezeDuration?: string | null
  warmupStartTime?: string | null
  warmupDuration?: string | null
  prefix?: string | null
  passwordLength?: number // @Min(4)
  penaltyTime?: number // @Min(0)
  isPublic?: boolean
}

/** 更新请求 — 镜像 `UpdateContestRequest.java`。所有字段可选。 */
export interface UpdateContestRequest {
  name?: string
  startTime?: string
  duration?: string
  freezeDuration?: string | null
  prefix?: string | null
  passwordLength?: number
  penaltyTime?: number
  isPublic?: boolean
}

/** 状态机变更请求 — 后端路径变量:POST /api/admin/contest/:id/status/:target */
export type ContestStatusTarget = ContestStatus

/** 列表查询参数 — 对应 `GET /api/admin/contest?page=1&size=20&status=PLANNING`。 */
export interface ContestListQuery {
  page?: number // 1-based
  size?: number // 1-100
  status?: ContestStatus | '' // 空串 = 不筛选
}
