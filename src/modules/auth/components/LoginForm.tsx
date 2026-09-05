import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { LogIn } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { login } from '@/platform/auth/authApi'
import { useAuth } from '@/platform/auth/useAuth'
import { ApiError } from '@/platform/api/errors'
import { ERROR_FALLBACK_MESSAGE, type ErrorCode } from '@/shared/types/error'

import { loginSchema, type LoginFormValues } from '@/modules/auth/schemas/loginSchema'

/**
 * 登录表单 — RHF + Zod 校验,成功后写 store 并跳 from 或 /admin/contests。
 *
 * 失败处理:
 *   - 优先显示后端 message(中文、精确,如 "密码错误")
 *   - 后端没给 message 时用 ERROR_FALLBACK_MESSAGE 兜底
 *   - 不在这里 navigate /login(MVP 不区分)
 */
export default function LoginForm() {
  const { login: setAuth } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/admin/contests'

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
    mode: 'onBlur',
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null)
    setSubmitting(true)
    try {
      const result = await login(values)
      setAuth({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        username: values.username,
        // MVP:后端硬编码 SUPER_ADMIN,前端不再二次请求 user 详情
        roles: ['SUPER_ADMIN'],
      })
      toast.success('登录成功')
      navigate(from, { replace: true })
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message || ERROR_FALLBACK_MESSAGE[err.code as ErrorCode] || '登录失败'
          : '登录失败,请稍后再试'
      setServerError(message)
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      {serverError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {serverError}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="username">用户名</Label>
        <Input
          id="username"
          autoComplete="username"
          autoFocus
          aria-invalid={Boolean(form.formState.errors.username)}
          {...form.register('username')}
        />
        {form.formState.errors.username && (
          <p className="text-xs text-destructive">{form.formState.errors.username.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">密码</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(form.formState.errors.password)}
          {...form.register('password')}
        />
        {form.formState.errors.password && (
          <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        <LogIn className="size-4" />
        {submitting ? '登录中…' : '登录'}
      </Button>
    </form>
  )
}
