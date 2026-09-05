/**
 * 报名表单 API — 后端 6 个 admin 端点的 thin wrapper。
 *
 * 端点契约来自 `RegistrationFormController.java`,全部需要 SUPER_ADMIN。
 * 路径前缀: /api/admin/registration/forms
 */

import { apiClient } from '@/platform/api/client'
import type { PageResult } from '@/shared/types/api'
import type {
  CreateFormRequest,
  RegistrationFormDetail,
  RegistrationFormListItem,
  SetSourceGroupRequest,
  UpdateFormRequest,
  FormListQuery,
} from '@/modules/registration/types/registration'

const BASE = '/api/admin/registration/forms'

/** GET /api/admin/registration/forms?page=&size= */
export async function listForms(query: FormListQuery = {}): Promise<PageResult<RegistrationFormListItem>> {
  const params: Record<string, string | number> = {}
  if (query.page !== undefined) params.page = query.page
  if (query.size !== undefined) params.size = query.size

  const res = await apiClient.get<PageResult<RegistrationFormListItem>>(BASE, { params })
  return res.data ?? { items: [], total: 0, page: query.page ?? 1, size: query.size ?? 20 }
}

/** GET /api/admin/registration/forms/:id */
export async function getForm(id: number): Promise<RegistrationFormDetail> {
  const res = await apiClient.get<RegistrationFormDetail>(`${BASE}/${id}`)
  if (!res.data) throw new Error('后端未返回表单详情')
  return res.data
}

/** POST /api/admin/registration/forms */
export async function createForm(req: CreateFormRequest): Promise<number> {
  const res = await apiClient.post<number>(BASE, req)
  if (typeof res.data !== 'number') throw new Error('后端未返回新表单 ID')
  return res.data
}

/** PUT /api/admin/registration/forms/:id */
export async function updateForm(id: number, req: UpdateFormRequest): Promise<void> {
  await apiClient.put<void>(`${BASE}/${id}`, req)
}

/** DELETE /api/admin/registration/forms/:id */
export async function deleteForm(id: number): Promise<void> {
  await apiClient.delete<void>(`${BASE}/${id}`)
}

/** PUT /api/admin/registration/forms/:id/source-group — 写 source → groupName 映射。 */
export async function setSourceGroup(id: number, req: SetSourceGroupRequest): Promise<void> {
  await apiClient.put<void>(`${BASE}/${id}/source-group`, req)
}