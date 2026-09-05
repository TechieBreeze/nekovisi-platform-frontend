/**
 * 报名记录 API — 后端 7 个 admin 端点的 thin wrapper(嵌套在 forms 路径下)。
 *
 * 端点契约来自 `RegistrationRecordController.java`。
 */

import { apiClient } from '@/platform/api/client'
import type { PageResult } from '@/shared/types/api'
import type {
  AddRecordRequest,
  BulkDeleteRequest,
  ImportRecordsRequest,
  ImportRecordsResponse,
  RecordListItem,
  RecordListQuery,
  UpdateRecordRequest,
} from '@/modules/registration/types/registration'

const base = (formId: number) => `/api/admin/registration/forms/${formId}/records`

/** GET /api/admin/registration/forms/:fid/records?page=&size=&source= */
export async function listRecords(
  formId: number,
  query: RecordListQuery = {},
): Promise<PageResult<RecordListItem>> {
  const params: Record<string, string | number> = {}
  if (query.page !== undefined) params.page = query.page
  if (query.size !== undefined) params.size = query.size
  if (query.source) params.source = query.source

  const res = await apiClient.get<PageResult<RecordListItem>>(base(formId), { params })
  return res.data ?? { items: [], total: 0, page: query.page ?? 1, size: query.size ?? 50 }
}

/** POST /api/admin/registration/forms/:fid/records */
export async function addRecord(formId: number, req: AddRecordRequest): Promise<number> {
  const res = await apiClient.post<number>(base(formId), req)
  if (typeof res.data !== 'number') throw new Error('后端未返回新记录 ID')
  return res.data
}

/** PATCH /api/admin/registration/forms/:fid/records/:rid */
export async function updateRecord(
  formId: number,
  recordId: number,
  req: UpdateRecordRequest,
): Promise<void> {
  await apiClient.patch<void>(`${base(formId)}/${recordId}`, req)
}

/** DELETE /api/admin/registration/forms/:fid/records/:rid */
export async function deleteRecord(formId: number, recordId: number): Promise<void> {
  await apiClient.delete<void>(`${base(formId)}/${recordId}`)
}

/** POST /api/admin/registration/forms/:fid/records/bulk-delete */
export async function bulkDeleteRecords(formId: number, req: BulkDeleteRequest): Promise<number> {
  const res = await apiClient.post<number>(`${base(formId)}/bulk-delete`, req)
  return res.data ?? 0
}

/** DELETE /api/admin/registration/forms/:fid/records/source/:source */
export async function deleteRecordsBySource(formId: number, source: string): Promise<number> {
  const res = await apiClient.delete<number>(`${base(formId)}/source/${encodeURIComponent(source)}`)
  return res.data ?? 0
}

/** POST /api/admin/registration/forms/:fid/records/import */
export async function importRecords(
  formId: number,
  req: ImportRecordsRequest,
): Promise<ImportRecordsResponse> {
  const res = await apiClient.post<ImportRecordsResponse>(`${base(formId)}/import`, req)
  if (!res.data) throw new Error('后端未返回导入结果')
  return res.data
}