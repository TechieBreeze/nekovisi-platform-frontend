import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  createTemplate,
  deleteTemplate,
  getTemplate,
  listTemplates,
  updateTemplate,
} from '@/modules/registration/api/fieldTemplates'
import type {
  CreateTemplateRequest,
  FieldTemplateListItem,
  UpdateTemplateRequest,
} from '@/modules/registration/types/registration'

const QUERY_KEYS = {
  list: ['registration-templates', 'list'] as const,
  detail: (id: number) => ['registration-templates', 'detail', id] as const,
}

export function useTemplateList() {
  return useQuery({
    queryKey: QUERY_KEYS.list,
    queryFn: () => listTemplates(),
  })
}

export function useTemplateDetail(id: number | undefined) {
  return useQuery<FieldTemplateListItem>({
    queryKey: QUERY_KEYS.detail(id ?? -1),
    queryFn: () => getTemplate(id!),
    enabled: typeof id === 'number' && id > 0,
  })
}

export function useCreateTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: CreateTemplateRequest) => createTemplate(req),
    onSuccess: (newId) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.list })
      toast.success(`模板已创建 (ID: ${newId})`)
    },
  })
}

export function useUpdateTemplate(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: UpdateTemplateRequest) => updateTemplate(id, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.list })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) })
      toast.success('模板已更新')
    },
  })
}

export function useDeleteTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.list })
      toast.success('模板已删除')
    },
  })
}