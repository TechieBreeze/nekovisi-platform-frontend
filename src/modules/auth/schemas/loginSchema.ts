import { z } from 'zod'

/**
 * 登录表单校验 — username/password 都必填。
 * 长度上限给一个软限制(后端 @NotBlank 不限长度,前端约束防滥用)。
 */
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, '请输入用户名')
    .max(64, '用户名过长'),
  password: z
    .string()
    .min(1, '请输入密码')
    .max(128, '密码过长'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
