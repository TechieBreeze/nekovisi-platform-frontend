/**
 * 字段模板 API — 后端 5 个 admin 端点的 thin wrapper。
 *
 * 端点契约来自 `FieldTemplateController.java`。
 */

import { apiClient } from '@/platform/api/client'
import type {
  CreateTemplateRequest,
  FieldTemplateListItem,
  UpdateTemplateRequest,
} from '@/modules/registration/types/registration'

const BASE = '/api/admin/registration/templates'

/** GET /api/admin/registration/templates */
export async function listTemplates(): Promise<FieldTemplateListItem[]> {
  const res = await apiClient.get<FieldTemplateListItem[]>(BASE)
  return res.data ?? []
}

/** GET /api/admin/registration/templates/:id */
export async function getTemplate(id: number): Promise<FieldTemplateListItem> {
  const res = await apiClient.get<FieldTemplateListItem>(`${BASE}/${id}`)
  if (!res.data) throw new Error('后端未返回模板详情')
  return res.data
}

/** POST /api/admin/registration/templates */
export async function createTemplate(req: CreateTemplateRequest): Promise<number> {
  const res = await apiClient.post<number>(BASE, req)
  if (typeof res.data !== 'number') throw new Error('后端未返回新模板 ID')
  return res.data
}

/** PUT /api/admin/registration/templates/:id */
export async function updateTemplate(id: number, req: UpdateTemplateRequest): Promise<void> {
  await apiClient.put<void>(`${BASE}/${id}`, req)
}

/** DELETE /api/admin/registration/templates/:id — 内置模板 409。 */
export async function deleteTemplate(id: number): Promise<void> {
  await apiClient.delete<void>(`${BASE}/${id}`)
}