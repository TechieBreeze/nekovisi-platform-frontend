import { describe, it, expect } from 'vitest'
import {
  formatDateTime,
  formatDateTimeShort,
  toDateTimeLocalInput,
  fromDateTimeLocalInput,
  nowIso,
} from './datetime'

describe('formatDateTime', () => {
  it('formats ISO with Shanghai offset', () => {
    // 2026-10-01T01:00:00Z == 2026-10-01 09:00 +08:00
    expect(formatDateTime('2026-10-01T01:00:00Z')).toBe('2026-10-01 09:00')
  })

  it('returns — for null/empty', () => {
    expect(formatDateTime(null)).toBe('—')
    expect(formatDateTime(undefined)).toBe('—')
    expect(formatDateTime('')).toBe('—')
  })
})

describe('formatDateTimeShort', () => {
  it('drops year', () => {
    expect(formatDateTimeShort('2026-10-01T01:00:00Z')).toBe('10-01 09:00')
  })
})

describe('toDateTimeLocalInput', () => {
  it('strips seconds and zone', () => {
    expect(toDateTimeLocalInput('2026-10-01T01:00:00Z')).toBe('2026-10-01T09:00')
  })

  it('returns empty string for null', () => {
    expect(toDateTimeLocalInput(null)).toBe('')
  })
})

describe('fromDateTimeLocalInput', () => {
  it('round-trips through toDateTimeLocalInput', () => {
    const iso = '2026-10-01T01:00:00Z'
    const local = toDateTimeLocalInput(iso)
    const back = fromDateTimeLocalInput(local)
    // back is +08:00 offset, the absolute time should be equivalent
    const orig = new Date(iso).getTime()
    const parsed = new Date(back).getTime()
    expect(Math.abs(orig - parsed)).toBeLessThan(1000)
  })

  it('throws on bad input', () => {
    expect(() => fromDateTimeLocalInput('not-a-date')).toThrow()
  })
})

describe('nowIso', () => {
  it('returns a parseable ISO string', () => {
    const iso = nowIso()
    expect(new Date(iso).toString()).not.toBe('Invalid Date')
    expect(iso).toMatch(/T/)
  })
})
