import { describe, it, expect } from 'vitest'
import {
  createContestSchema,
  createContestPayload,
  updateContestPayload,
} from './contestSchema'

const baseValid = {
  name: '秋季赛',
  startTime: '2026-10-01T09:00:00+08:00',
  duration: { hours: 5, minutes: 0 },
  passwordLength: 8,
  penaltyTime: 20,
  isPublic: true,
}

describe('createContestSchema', () => {
  it('accepts a valid form', () => {
    expect(() => createContestSchema.parse(baseValid)).not.toThrow()
  })

  it('rejects empty name', () => {
    const r = createContestSchema.safeParse({ ...baseValid, name: '' })
    expect(r.success).toBe(false)
  })

  it('rejects name > 200', () => {
    const r = createContestSchema.safeParse({ ...baseValid, name: 'x'.repeat(201) })
    expect(r.success).toBe(false)
  })

  it('rejects missing startTime', () => {
    const { startTime, ...rest } = baseValid
    const r = createContestSchema.safeParse(rest)
    expect(r.success).toBe(false)
  })

  it('rejects negative duration hours', () => {
    const r = createContestSchema.safeParse({
      ...baseValid,
      duration: { hours: -1, minutes: 0 },
    })
    expect(r.success).toBe(false)
  })

  it('rejects minutes > 59', () => {
    const r = createContestSchema.safeParse({
      ...baseValid,
      duration: { hours: 0, minutes: 60 },
    })
    expect(r.success).toBe(false)
  })

  it('rejects passwordLength < 4', () => {
    const r = createContestSchema.safeParse({ ...baseValid, passwordLength: 3 })
    expect(r.success).toBe(false)
  })

  it('rejects passwordLength > 32', () => {
    const r = createContestSchema.safeParse({ ...baseValid, passwordLength: 64 })
    expect(r.success).toBe(false)
  })

  it('rejects negative penaltyTime', () => {
    const r = createContestSchema.safeParse({ ...baseValid, penaltyTime: -1 })
    expect(r.success).toBe(false)
  })

  it('accepts freezeDuration as optional and valid', () => {
    const r = createContestSchema.safeParse({
      ...baseValid,
      freezeDuration: { hours: 1, minutes: 0 },
    })
    expect(r.success).toBe(true)
  })
})

describe('createContestPayload', () => {
  it('composes duration.hours into PT{H}H string', () => {
    const out = createContestPayload({
      ...baseValid,
      duration: { hours: 5, minutes: 0 },
    })
    expect(out.duration).toBe('PT5H')
  })

  it('composes duration.hours+minutes into PT{H}H{M}M', () => {
    const out = createContestPayload({
      ...baseValid,
      duration: { hours: 1, minutes: 30 },
    })
    expect(out.duration).toBe('PT1H30M')
  })

  it('emits PT0S when both 0', () => {
    const out = createContestPayload({
      ...baseValid,
      duration: { hours: 0, minutes: 0 },
    })
    expect(out.duration).toBe('PT0S')
  })

  it('trims name', () => {
    const out = createContestPayload({ ...baseValid, name: '  sp  ace  ' })
    expect(out.name).toBe('sp  ace')
  })

  it('omits freezeDuration when undefined', () => {
    const out = createContestPayload(baseValid)
    expect(out.freezeDuration).toBeUndefined()
  })

  it('includes freezeDuration when present', () => {
    const out = createContestPayload({
      ...baseValid,
      freezeDuration: { hours: 1, minutes: 0 },
    })
    expect(out.freezeDuration).toBe('PT1H')
  })

  it('empty prefix becomes undefined', () => {
    const out = createContestPayload({ ...baseValid, prefix: '' })
    expect(out.prefix).toBeUndefined()
  })
})

describe('updateContestPayload', () => {
  it('reuses createContestPayload shape', () => {
    const out = updateContestPayload({
      ...baseValid,
      duration: { hours: 2, minutes: 30 },
    })
    expect(out.duration).toBe('PT2H30M')
  })
})
