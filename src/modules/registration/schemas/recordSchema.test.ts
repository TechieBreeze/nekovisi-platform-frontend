import { describe, it, expect } from 'vitest'

import { buildRecordSchema, recordPayload } from './recordSchema'
import type { FieldDef } from '@/modules/registration/types/registration'

/** 复用 backend RecordValidatorTest 的字段结构。 */
const teamFields: FieldDef[] = [
  { key: 'team_name', label: '队伍名', type: 'TEXT', required: true, maxLength: 100 },
  { key: 'age', label: '年龄', type: 'NUMBER', required: false, min: 0, max: 150 },
  {
    key: 'grade',
    label: '年级',
    type: 'SELECT',
    required: true,
    options: ['大一', '大二', '大三'],
  },
  {
    key: 'tags',
    label: '标签',
    type: 'MULTISELECT',
    required: false,
    options: ['a', 'b', 'c'],
  },
]

describe('buildRecordSchema', () => {
  it('accepts a fully valid record', () => {
    const schema = buildRecordSchema(teamFields)
    const r = schema.safeParse({
      team_name: '我的队伍',
      age: 21,
      grade: '大三',
      tags: ['a', 'c'],
    })
    expect(r.success).toBe(true)
  })

  it('rejects missing required field (team_name)', () => {
    const schema = buildRecordSchema(teamFields)
    const r = schema.safeParse({ age: 21, grade: '大三' })
    expect(r.success).toBe(false)
  })

  it('rejects NUMBER above max (age=999)', () => {
    const schema = buildRecordSchema(teamFields)
    const r = schema.safeParse({ team_name: 'x', age: 999, grade: '大三' })
    expect(r.success).toBe(false)
  })

  it('rejects SELECT value not in options (grade=博士)', () => {
    const schema = buildRecordSchema(teamFields)
    const r = schema.safeParse({ team_name: 'x', grade: '博士' })
    expect(r.success).toBe(false)
  })

  it('rejects MULTISELECT with invalid item', () => {
    const schema = buildRecordSchema(teamFields)
    const r = schema.safeParse({
      team_name: 'x',
      grade: '大三',
      tags: ['a', 'x'],
    })
    expect(r.success).toBe(false)
  })

  it('rejects TEXT exceeding maxLength', () => {
    const schema = buildRecordSchema(teamFields)
    const r = schema.safeParse({ team_name: 'x'.repeat(200), grade: '大三' })
    expect(r.success).toBe(false)
  })

  it('accepts NUMBER as string and parses', () => {
    const schema = buildRecordSchema(teamFields)
    const r = schema.parse({ team_name: 'x', grade: '大一', age: '25' })
    expect(r.age).toBe(25)
  })

  it('passes through unknown keys (向后兼容)', () => {
    const schema = buildRecordSchema(teamFields)
    const r = schema.parse({
      team_name: 'x',
      grade: '大三',
      old_field_kept_for_history: 'stale',
    })
    expect((r as Record<string, unknown>).old_field_kept_for_history).toBe('stale')
  })

  it('optional field: missing is OK', () => {
    const schema = buildRecordSchema(teamFields)
    const r = schema.safeParse({ team_name: 'x', grade: '大三' })
    expect(r.success).toBe(true)
  })
})

describe('recordPayload', () => {
  it('drops undefined values, keeps others', () => {
    const out = recordPayload({
      team_name: 'x',
      age: undefined,
      grade: '大三',
    })
    expect(out).toEqual({ team_name: 'x', grade: '大三' })
  })

  it('keeps empty array (区别于 undefined)', () => {
    const out = recordPayload({
      team_name: 'x',
      tags: [],
    })
    expect(out.tags).toEqual([])
  })
})