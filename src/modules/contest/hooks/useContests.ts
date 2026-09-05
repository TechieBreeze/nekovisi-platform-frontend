import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  changeContestStatus,
  createContest,
  deleteContest,
  getContest,
  listContests,
  updateContest,
} from '@/modules/contest/api/contests'
import type {
  ContestEntity,
  ContestListItem,
  ContestListQuery,
  ContestStatus,
  CreateContestRequest,
  UpdateContestRequest,
} from '@/modules/contest/types/contest'

const QUERY_KEYS = {
  list: (query: ContestListQuery) => ['contests', 'list', query] as const,
  detail: (id: number) => ['contests', 'detail', id] as const,
}

/** 列表 — 后端已按 status/page/size 筛过,queryKey 包含这些参数所以能正确缓存。 */
export function useContestList(query: ContestListQuery = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.list(query),
    queryFn: () => listContests(query),
  })
}

/** 详情 */
export function useContestDetail(id: number | undefined) {
  return useQuery<ContestEntity>({
    queryKey: QUERY_KEYS.detail(id ?? -1),
    queryFn: () => getContest(id!),
    enabled: typeof id === 'number' && id > 0,
  })
}

/** 创建 — 成功后 invalidate 列表,toast 成功;失败由调用方 onError 处理。 */
export function useCreateContest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: CreateContestRequest) => createContest(req),
    onSuccess: (newId) => {
      qc.invalidateQueries({ queryKey: ['contests', 'list'] })
      toast.success(`赛事已创建 (ID: ${newId})`)
    },
  })
}

/** 更新 — invalidate 列表 + 当前详情 */
export function useUpdateContest(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: UpdateContestRequest) => updateContest(id, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contests', 'list'] })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) })
      toast.success('赛事已更新')
    },
  })
}

/** 状态机变更 — invalidate 列表 + 当前详情 */
export function useChangeContestStatus(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (target: ContestStatus) => changeContestStatus(id, target),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contests', 'list'] })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) })
      toast.success('状态已更新')
    },
  })
}

/** 删除(软删) — invalidate 列表 */
export function useDeleteContest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteContest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contests', 'list'] })
      toast.success('赛事已删除')
    },
  })
}

/** 列表项类型导出 — 让页面/组件可以共享 */
export type { ContestListItem }
