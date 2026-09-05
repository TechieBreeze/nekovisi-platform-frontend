import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  addRecord,
  bulkDeleteRecords,
  deleteRecord,
  deleteRecordsBySource,
  importRecords,
  listRecords,
  updateRecord,
} from '@/modules/registration/api/registrationRecords'
import type {
  AddRecordRequest,
  BulkDeleteRequest,
  ImportRecordsRequest,
  ImportRecordsResponse,
  RecordListItem,
  RecordListQuery,
  UpdateRecordRequest,
} from '@/modules/registration/types/registration'

const QUERY_KEYS = {
  list: (formId: number, query: RecordListQuery) =>
    ['registration-forms', formId, 'records', 'list', query] as const,
}

export function useRecordList(formId: number, query: RecordListQuery = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.list(formId, query),
    queryFn: () => listRecords(formId, query),
    enabled: typeof formId === 'number' && formId > 0,
  })
}

export function useAddRecord(formId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: AddRecordRequest) => addRecord(formId, req),
    onSuccess: (newId) => {
      qc.invalidateQueries({ queryKey: ['registration-forms', formId, 'records'] })
      qc.invalidateQueries({ queryKey: ['registration-forms', 'detail', formId] })
      toast.success(`记录已添加 (ID: ${newId})`)
    },
  })
}

export function useUpdateRecord(formId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ recordId, req }: { recordId: number; req: UpdateRecordRequest }) =>
      updateRecord(formId, recordId, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['registration-forms', formId, 'records'] })
      toast.success('记录已更新')
    },
  })
}

export function useDeleteRecord(formId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (recordId: number) => deleteRecord(formId, recordId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['registration-forms', formId, 'records'] })
      qc.invalidateQueries({ queryKey: ['registration-forms', 'detail', formId] })
      toast.success('记录已删除')
    },
  })
}

export function useBulkDeleteRecords(formId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: BulkDeleteRequest) => bulkDeleteRecords(formId, req),
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ['registration-forms', formId, 'records'] })
      qc.invalidateQueries({ queryKey: ['registration-forms', 'detail', formId] })
      toast.success(`已删除 ${count} 条记录`)
    },
  })
}

export function useDeleteRecordsBySource(formId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (source: string) => deleteRecordsBySource(formId, source),
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ['registration-forms', formId, 'records'] })
      qc.invalidateQueries({ queryKey: ['registration-forms', 'detail', formId] })
      toast.success(`已删除 source 下的 ${count} 条记录`)
    },
  })
}

export function useImportRecords(formId: number) {
  const qc = useQueryClient()
  return useMutation<ImportRecordsResponse, Error, ImportRecordsRequest>({
    mutationFn: (req) => importRecords(formId, req),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['registration-forms', formId, 'records'] })
      qc.invalidateQueries({ queryKey: ['registration-forms', 'detail', formId] })
      if (res.errorCount === 0) {
        toast.success(`成功导入 ${res.successCount} 条记录`)
      } else {
        toast.warning(`导入完成:成功 ${res.successCount} / 失败 ${res.errorCount}`)
      }
    },
  })
}

export type { RecordListItem }