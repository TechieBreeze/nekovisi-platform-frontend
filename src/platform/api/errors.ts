/**
 * ApiError — 把后端 ApiResponse.fail 形状包装成可被 TanStack Query / try-catch 捕获的 Error。
 *
 * 调用约定:
 *   - HTTP 层(client.ts)在响应拦截器里**保证**所有非 2xx 都被转成 ApiError throw
 *   - 业务层拿到的 catch 块一定 instanceof ApiError,可以直接读 `e.code` / `e.httpStatus`
 *   - 想看原始响应 payload 时用 `e.raw`(目前保留以备调试)
 *
 * 网络层错误(后端不可达 / CORS / 超时)走另一个分支:
 *   - Axios 抛的 error 会被外层 catch 统一包装成 ApiError(INTERNAL_ERROR, ...)
 *   - 401 是已知业务语义,会保留 code = "UNAUTHORIZED"
 */

import type { ApiResponse } from '@/shared/types/api'
import type { ErrorCode } from '@/shared/types/error'

export class ApiError extends Error {
  readonly code: ErrorCode | string
  readonly httpStatus: number
  readonly requestId?: string
  readonly raw?: ApiResponse<unknown>

  constructor(args: {
    code: ErrorCode | string
    message: string
    httpStatus: number
    requestId?: string
    raw?: ApiResponse<unknown>
  }) {
    super(args.message)
    this.name = 'ApiError'
    this.code = args.code
    this.httpStatus = args.httpStatus
    this.requestId = args.requestId
    this.raw = args.raw
  }

  /** 是否可重试(网络层 / 5xx 通常重试,4xx 业务错误不该重试)。 */
  get isRetryable(): boolean {
    if (this.code === 'INTERNAL_ERROR') return true
    return this.httpStatus >= 500
  }

  /** 是否需要踢回登录。401 全局 handler 会拦截,这里只用于组件级判断。 */
  get isUnauthorized(): boolean {
    return this.httpStatus === 401 || this.code === 'UNAUTHORIZED'
  }
}
