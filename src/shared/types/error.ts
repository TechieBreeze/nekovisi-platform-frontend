/**
 * 业务错误码 — 1:1 镜像后端 `BusinessException` / `GlobalExceptionHandler`。
 *
 * 后端约定:
 *   - 业务异常用 BusinessException(code, msg, httpStatus) 构造
 *   - @Valid 校验失败 → VALIDATION_ERROR + 400
 *   - AuthenticationException → UNAUTHORIZED + 401
 *   - AccessDeniedException → FORBIDDEN + 403
 *   - 兜底 Exception → INTERNAL_ERROR + 500
 *
 * 前端 ApiError.code 直接对得上这套枚举,见 platform/api/errors.ts。
 */
export type ErrorCode =
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INVALID_STATE_TRANSITION'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'

/**
 * 错误码 → HTTP 状态码(反向映射)。
 * 后端的 httpStatus 字段已存在,这里只在前端做轻量校验 / 行为判断用。
 */
export const ERROR_HTTP_STATUS: Record<ErrorCode, number> = {
  NOT_FOUND: 404,
  CONFLICT: 409,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INVALID_STATE_TRANSITION: 409,
  VALIDATION_ERROR: 400,
  INTERNAL_ERROR: 500,
}

/**
 * 错误码 → 用户可读消息。
 *
 * 优先级:ApiError.message(后端返回的中文描述,通常带字段上下文) > 这里的兜底。
 * 兜底仅在 message 为空时使用,例如 toaster 显示的统一提示。
 */
export const ERROR_FALLBACK_MESSAGE: Record<ErrorCode, string> = {
  NOT_FOUND: '资源不存在',
  CONFLICT: '操作冲突',
  BAD_REQUEST: '请求参数有误',
  UNAUTHORIZED: '请先登录',
  FORBIDDEN: '没有权限',
  INVALID_STATE_TRANSITION: '不允许的状态切换',
  VALIDATION_ERROR: '请检查表单填写',
  INTERNAL_ERROR: '服务器内部错误,请稍后再试',
}
