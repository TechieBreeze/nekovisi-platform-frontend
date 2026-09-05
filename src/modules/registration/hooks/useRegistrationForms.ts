import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  createForm,
  deleteForm,
  getForm,
  listForms,
  setSourceGroup,
  updateForm,
} from '@/modules/registration/api/registrationForms'
import type {
  CreateFormRequest,
  FormListQuery,
  RegistrationFormDetail,
  RegistrationFormListItem,
  SetSourceGroupRequest,
  UpdateFormRequest,
} from '@/modules/registration/types/registration'

const QUERY_KEYS = {
  list: (query: FormListQuery) => ['registration-forms', 'list', query] as const,
  detail: (id: number) => ['registration-forms', 'detail', id] as const,
}

export function useFormList(query: FormListQuery = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.list(query),
    queryFn: () => listForms(query),
  })
}

export function useFormDetail(id: number | undefined) {
  return useQuery<RegistrationFormDetail>({
    queryKey: QUERY_KEYS.detail(id ?? -1),
    queryFn: () => getForm(id!),
    enabled: typeof id === 'number' && id > 0,
  })
}

export function useCreateForm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: CreateFormRequest) => createForm(req),
    onSuccess: (newId) => {
      qc.invalidateQueries({ queryKey: ['registration-forms', 'list'] })
      toast.success(`表单已创建 (ID: ${newId})`)
    },
  })
}

export function useUpdateForm(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: UpdateFormRequest) => updateForm(id, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['registration-forms', 'list'] })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) })
      toast.success('表单已更新')
    },
  })
}

export function useDeleteForm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteForm(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['registration-forms', 'list'] })
      toast.success('表单已删除')
    },
  })
}

export function useSetSourceGroup(formId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: SetSourceGroupRequest) => setSourceGroup(formId, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.detail(formId) })
      toast.success('source → group 映射已保存')
    },
  })
}

export type { RegistrationFormListItem, RegistrationFormDetail }