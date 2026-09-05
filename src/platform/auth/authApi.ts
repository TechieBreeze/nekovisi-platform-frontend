/**
 * Auth API 调用 — 登录 / 刷新 / 登出。
 *
 * LoginResult 字段名严格对齐后端 `LoginResult` record 的驼峰命名。
 */

import { apiClient } from '@/platform/api/client'

const BASE = '/api/auth'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResult {
  accessToken: string
  refreshToken: string
  accessTtlSeconds: number
  refreshTtlSeconds: number
}

export async function login(req: LoginRequest): Promise<LoginResult> {
  const res = await apiClient.post<LoginResult>(`${BASE}/login`, req)
  if (!res.data) throw new Error('登录响应为空')
  return res.data
}

export interface RefreshRequest {
  refreshToken: string
}

export async function refresh(req: RefreshRequest): Promise<LoginResult> {
  const res = await apiClient.post<LoginResult>(`${BASE}/refresh`, req)
  if (!res.data) throw new Error('刷新响应为空')
  return res.data
}

export async function logout(): Promise<void> {
  await apiClient.post<void>(`${BASE}/logout`)
}
