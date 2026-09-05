/**
 * 报名表模块类型 — 1:1 镜像后端 `modules/registration/**`。
 *
 * 关键约束(workspace CLAUDE.md §4 后端踩坑点):
 *   - fieldsJson / sourceGroupsJson / dataJson 都是 **JSON 字符串**,前端按需 JSON.parse
 *     但字段定义场景(fields)需要编辑,所以 fieldsJson 会 parse → 编辑 → 提交时再 stringify
 *   - data 是 **Map<String, Object>**,值可能是 string / number / string[]
 *   - 分页 page 从 1 开始,size clamp [1, 100]
 *
 * 设计选择(见 docs/adr/0007-dynamic-fields-not-hardcoded.md):
 *   字段定义是动态可编辑的,不像 contest 的 medalConfigJson 只读展示。
 */

/** 字段定义类型 — 后端 FieldType enum。字符串字面量联合,避免 enum 运行时开销。 */
export type FieldType = 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'SELECT' | 'MULTISELECT' | 'DATE'

/** 单个字段定义 — 镜像后端 FieldDefDto.java。 */
export interface FieldDef {
  key: string
  label: string
  type: FieldType
  required: boolean
  maxLength?: number | null
  min?: number | null
  max?: number | null
  options?: string[] | null
}

/** 单条报名记录的动态数据 — 值的类型由字段定义决定。
 *  编辑 / 提交走 Map,后端 Jackson 反序列化到 LinkedHashMap。 */
export type RecordData = Record<string, string | number | string[] | undefined>

/** 表单列表项 — 镜像 RegistrationFormListItem。 */
export interface RegistrationFormListItem {
  id: number
  name: string
  description: string
  status: string // MVP 暂未用状态机,后端返回 'draft'
  recordCount: number
  sourceCount: number
  createdAt: string
  updatedAt: string
}

/** 表单详情 — 镜像 RegistrationFormEntity + 解析后的 fields + sourceGroups。
 *  后端存 JSONB 字符串,前端 detail 已 parse 完。
 *  详情页编辑字段后,提交时再 stringify。 */
export interface RegistrationFormDetail {
  id: number
  name: string
  description: string
  status: string
  fields: FieldDef[]
  sourceGroups: Record<string, string>
  recordCount: number
  createdAt: string
  updatedAt: string
}

/** 报名记录列表项 — 镜像 RecordListItem。 */
export interface RecordListItem {
  id: number
  formId: number
  contestId: number | null
  sourceGroup: string | null
  source: string
  data: RecordData
  status: string // MVP 暂未用:'active'
  createdAt: string
  updatedAt: string
}

/** 模板列表项 — 镜像 TemplateListItem。 */
export interface FieldTemplateListItem {
  id: number
  name: string
  isBuiltin: boolean
  fieldCount: number
  fields: FieldDef[]
  createdAt: string
  updatedAt: string
}

/** 创建表单请求 — 镜像 CreateFormRequest。 */
export interface CreateFormRequest {
  name: string
  description?: string
  fields: FieldDef[]
  templateId?: number | null
}

/** 更新表单请求 — 镜像 UpdateFormRequest(本期全部字段可选)。 */
export interface UpdateFormRequest {
  name?: string
  description?: string
  fields?: FieldDef[]
}

/** source-group 映射请求 — 镜像 SetSourceGroupRequest。 */
export interface SetSourceGroupRequest {
  source: string
  groupName: string
}

/** 新增记录请求 — 镜像 AddRecordRequest。 */
export interface AddRecordRequest {
  data: RecordData
  source?: string
  sourceGroup?: string | null
}

/** 更新记录请求 — 镜像 UpdateRecordRequest。 */
export interface UpdateRecordRequest {
  data: RecordData
  source?: string
  sourceGroup?: string | null
}

/** 批量删除请求 — 镜像 BulkDeleteRequest。 */
export interface BulkDeleteRequest {
  ids: number[]
}

/** 导入结果响应 — 镜像 ImportRecordsResponse。 */
export interface ImportRecordsResponse {
  source: string
  totalCount: number
  successCount: number
  errorCount: number
  replaced: boolean
  errors: ImportErrorItem[]
}

/** 导入单条错误 — 镜像 ImportErrorItem。 */
export interface ImportErrorItem {
  rowIndex: number
  reason: string
}

/** 列表查询参数 — 对应 GET /api/admin/registration/forms?page=1&size=20。 */
export interface FormListQuery {
  page?: number
  size?: number
}

/** 记录列表查询 — 对应 GET /api/admin/registration/forms/{fid}/records?page=&size=&source=。 */
export interface RecordListQuery {
  page?: number
  size?: number
  source?: string
}