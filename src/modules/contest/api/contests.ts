/**
 * 赛事模块 API 调用 — 后端 6 个 admin 端点的 thin wrapper。
 *
 * 端点契约来自 `ContestController.java`,全部需要 SUPER_ADMIN。
 * 不在每个 hook 里直接写 axios 调用,而是抽到这里,这样:
 *   - 端点路径只在一处维护(后端改路径只改这里)
 *   - mock / Orval 后续接入只换实现
 */

import { apiClient } from '@/platform/api/client'
import type { PageResult } from '@/shared/types/api'
import type {
  ContestEntity,
  ContestListItem,
  ContestListQuery,
  ContestStatus,
  CreateContestRequest,
  UpdateContestRequest,
} from '@/modules/contest/types/contest'

const BASE = '/api/admin/contest'

/** GET /api/admin/contest?page=&size=&status= */
export async function listContests(
  query: ContestListQuery = {},
): Promise<PageResult<ContestListItem>> {
  const params: Record<string, string | number> = {}
  if (query.page !== undefined) params.page = query.page
  if (query.size !== undefined) params.size = query.size
  if (query.status) params.status = query.status

  const res = await apiClient.get<PageResult<ContestListItem>>(BASE, { params })
  // 后端:success=true,data=PageResult。client 拦截器已剥信封。
  // 兜底:返回 undefined 时给个空 page。
  return res.data ?? { items: [], total: 0, page: query.page ?? 1, size: query.size ?? 20 }
}

/** GET /api/admin/contest/:id */
export async function getContest(id: number): Promise<ContestEntity> {
  const res = await apiClient.get<ContestEntity>(`${BASE}/${id}`)
  if (!res.data) throw new Error('后端未返回赛事详情')
  return res.data
}

/** POST /api/admin/contest */
export async function createContest(req: CreateContestRequest): Promise<number> {
  const res = await apiClient.post<number>(BASE, req)
  if (typeof res.data !== 'number') throw new Error('后端未返回新赛事 ID')
  return res.data
}

/** PUT /api/admin/contest/:id */
export async function updateContest(id: number, req: UpdateContestRequest): Promise<void> {
  await apiClient.put<void>(`${BASE}/${id}`, req)
}

/** POST /api/admin/contest/:id/status/:target */
export async function changeContestStatus(
  id: number,
  target: ContestStatus,
): Promise<void> {
  await apiClient.post<void>(`${BASE}/${id}/status/${target}`)
}

/** DELETE /api/admin/contest/:id */
export async function deleteContest(id: number): Promise<void> {
  await apiClient.delete<void>(`${BASE}/${id}`)
}
