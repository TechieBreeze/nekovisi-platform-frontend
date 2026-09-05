/**
 * API 响应信封 — 1:1 镜像后端 `ApiResponse<T>` record
 * @see nekovisi-platform-backend/src/main/java/.../common/response/ApiResponse.java
 *
 * 字段说明:
 *   - `success`: true 表示成功(此时 `code === "0"`),false 表示失败
 *   - `code`:    业务码。`"0"` = 成功;其他见 `error.ts` ErrorCode
 *   - `message`: 用户可读消息(中文,直接展示给用户)
 *   - `data`:    业务载荷,失败时为 null(@JsonInclude(NON_NULL) 会省略字段)
 *   - `requestId`: 服务端生成的请求 ID,排查问题时上报
 */
export interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data?: T
  requestId?: string
}

/**
 * 分页结果信封 — 1:1 镜像后端 `PageResult<T>` record
 *
 * **页码从 1 开始**(后端 `defaultValue = "1"`),`size` 由后端 clamp 到 [1, 100]。
 * `total` 是**过滤后**的总数,不是表行数。
 */
export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  size: number
}
