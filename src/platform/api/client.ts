/**
 * HTTP 客户端 — Axios 实例 + 拦截器
 *
 * 职责:
 *   1. baseURL 读 VITE_API_BASE_URL(默认 http://localhost:8080)
 *   2. 请求拦截器:自动挂 `Authorization: Bearer <token>`(从 tokenRef 拿)
 *   3. 响应拦截器:
 *      - 解 `ApiResponse<T>` 信封:success=true → 返回 data;success=false → throw ApiError
 *      - 非 2xx HTTP:也 throw ApiError,code 按 HTTP 推断
 *      - 网络层失败(后端不可达 / 超时):throw ApiError(INTERNAL_ERROR, ...)
 *
 * 用法:
 *   import { apiClient } from '@/platform/api/client'
 *   const res = await apiClient.get<ContestListItem[]>('/api/admin/contest')
 *   // res 已经是 ApiResponse<T> 的 data 字段
 */

import axios, { AxiosError, type AxiosInstance, type AxiosResponse } from 'axios'

import type { ApiResponse } from '@/shared/types/api'
import type { ErrorCode } from '@/shared/types/error'
import { getAccessToken } from '@/platform/auth/tokenRef'
import { ApiError } from '@/platform/api/errors'

const DEFAULT_BASE_URL = 'http://localhost:8080'
const DEFAULT_TIMEOUT_MS = 15_000

const baseURL = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BASE_URL

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ===== 请求拦截器:挂 Authorization =====

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

// ===== 响应拦截器:解信封 + 错误归一化 =====

apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    const payload = response.data

    // 兜底:后端没按信封返(理论上不会发生,Java 编译器约束)
    if (payload === null || typeof payload !== 'object' || !('success' in payload)) {
      throw new ApiError({
        code: 'INTERNAL_ERROR',
        message: '后端响应格式异常:不是 ApiResponse 信封',
        httpStatus: response.status,
      })
    }

    if (payload.success) {
      // 调用方拿到的就是 data 字段(后端 ok() 单独调用不带 data 时是 undefined)
      // 这里直接把 data 字段塞回 response.data 替代整个信封,
      // 让 `apiClient.get<T>('/...')` 的返回类型符合 T 而不是 ApiResponse<T>
      // 业务调用方会通过泛型 T 收窄类型,这里需要 unknown → any 跨过类型边界
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(response.data as unknown) = payload.data as any
      return response
    }

    // success=false → 业务错误
    throw new ApiError({
      code: (payload.code as ErrorCode | string) ?? 'INTERNAL_ERROR',
      message: payload.message || '请求失败',
      httpStatus: response.status,
      requestId: payload.requestId,
      raw: payload,
    })
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    // 网络层 / 超时 / CORS
    if (!error.response) {
      throw new ApiError({
        code: 'INTERNAL_ERROR',
        message: error.message || '网络异常,请检查后端是否启动',
        httpStatus: 0,
      })
    }

    // 后端有响应但不是 2xx
    const payload = error.response.data
    const httpStatus = error.response.status

    // 如果后端按 ApiResponse 信封返了,优先取里面的 code / message
    if (payload && typeof payload === 'object' && 'success' in payload && payload.success === false) {
      throw new ApiError({
        code: (payload.code as ErrorCode | string) ?? httpStatusToCode(httpStatus),
        message: payload.message || error.message,
        httpStatus,
        requestId: payload.requestId,
        raw: payload,
      })
    }

    // 否则按 HTTP 状态推断 code
    throw new ApiError({
      code: httpStatusToCode(httpStatus),
      message: error.message || `HTTP ${httpStatus}`,
      httpStatus,
    })
  },
)

/** HTTP 状态码 → ErrorCode 兜底(只在后端没按信封返时使用)。 */
function httpStatusToCode(status: number): ErrorCode {
  if (status === 401) return 'UNAUTHORIZED'
  if (status === 403) return 'FORBIDDEN'
  if (status === 404) return 'NOT_FOUND'
  if (status === 409) return 'CONFLICT'
  if (status === 400) return 'BAD_REQUEST'
  return 'INTERNAL_ERROR'
}
