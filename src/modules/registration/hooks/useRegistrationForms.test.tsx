import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor, act } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import type { ReactNode } from 'react'

import {
  useCreateForm,
  useDeleteForm,
  useFormDetail,
  useFormList,
} from './useRegistrationForms'
import { setAccessTokenGetter } from '@/platform/auth/tokenRef'
import { useAuthStore } from '@/platform/auth/authStore'

const API = 'http://localhost:8080'

const server = setupServer(
  // list
  http.get(`${API}/api/admin/registration/forms`, () =>
    HttpResponse.json({
      success: true,
      code: '0',
      message: 'OK',
      data: {
        items: [
          {
            id: 1, name: 'ICPC 报名', description: '', status: 'draft',
            recordCount: 3, sourceCount: 2,
            createdAt: '2026-09-01T10:00:00+08:00',
            updatedAt: '2026-09-02T11:00:00+08:00',
          },
        ],
        total: 1, page: 1, size: 20,
      },
    }),
  ),
  // detail
  http.get(`${API}/api/admin/registration/forms/:id`, ({ params }) =>
    HttpResponse.json({
      success: true,
      code: '0',
      message: 'OK',
      data: {
        id: Number(params.id), name: `form-${params.id}`, description: '',
        status: 'draft',
        fields: [{ key: 'team_name', label: '队伍名', type: 'TEXT', required: true, maxLength: 100 }],
        sourceGroups: {}, recordCount: 0,
        createdAt: '2026-09-01T10:00:00+08:00',
        updatedAt: '2026-09-01T10:00:00+08:00',
      },
    }),
  ),
  // create
  http.post(`${API}/api/admin/registration/forms`, () =>
    HttpResponse.json({ success: true, code: '0', message: 'OK', data: 999 }),
  ),
  // delete
  http.delete(`${API}/api/admin/registration/forms/:id`, () =>
    HttpResponse.json({ success: true, code: '0', message: 'OK' }),
  ),
)

beforeEach(() => {
  server.listen({ onUnhandledRequest: 'error' })
  useAuthStore.setState({
    accessToken: 'FAKE_TOKEN',
    refreshToken: 'FAKE_REFRESH',
    user: { username: 'admin', roles: ['SUPER_ADMIN'] },
  })
  setAccessTokenGetter(() => useAuthStore.getState().accessToken)
})

afterEach(() => {
  server.resetHandlers()
  server.close()
  localStorage.clear()
})

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

describe('useFormList', () => {
  it('returns paged forms', async () => {
    const { result } = renderHook(() => useFormList({ page: 1, size: 20 }), {
      wrapper: makeWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.total).toBe(1)
    expect(result.current.data!.items[0].name).toBe('ICPC 报名')
  })
})

describe('useFormDetail', () => {
  it('fetches form by id and parses fields', async () => {
    const { result } = renderHook(() => useFormDetail(7), {
      wrapper: makeWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.fields[0].key).toBe('team_name')
  })

  it('does not fetch when id is undefined', () => {
    const { result } = renderHook(() => useFormDetail(undefined), {
      wrapper: makeWrapper(),
    })
    expect(result.current.isFetching).toBe(false)
  })
})

describe('useCreateForm', () => {
  it('posts payload and returns new id', async () => {
    const { result } = renderHook(() => useCreateForm(), {
      wrapper: makeWrapper(),
    })
    let returnedId: number | undefined
    await act(async () => {
      returnedId = await result.current.mutateAsync({
        name: 'New Form',
        fields: [{ key: 'k', label: 'K', type: 'TEXT', required: true, maxLength: 10 }],
      } as never)
    })
    expect(returnedId).toBe(999)
  })
})

describe('useDeleteForm', () => {
  it('DELETEs /api/admin/registration/forms/:id', async () => {
    const { result } = renderHook(() => useDeleteForm(), {
      wrapper: makeWrapper(),
    })
    await act(async () => {
      await result.current.mutateAsync(13)
    })
    expect(result.current.isSuccess).toBe(true)
  })
})