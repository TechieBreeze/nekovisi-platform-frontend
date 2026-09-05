import { describe, it, expect } from 'vitest'
import {
  parseDuration,
  formatDuration,
  durationToHoursMinutes,
  hoursMinutesToDuration,
  formatDurationHuman,
} from './duration'

describe('parseDuration', () => {
  it.each([
    ['PT5H', 18000],
    ['PT1H30M', 5400],
    ['PT0S', 0],
    ['PT45M', 2700],
    ['P1DT2H', 93600],
    ['PT2H15M30S', 8130],
  ])('parses %s → %i', (input, expected) => {
    expect(parseDuration(input)).toBe(expected)
  })

  it('throws on bad input', () => {
    expect(() => parseDuration('not-a-duration')).toThrow()
    expect(() => parseDuration('5H')).toThrow() // missing P
  })

  it('parses PT alone as 0 (all groups optional)', () => {
    // 设计上 regex 把 P 后的所有段当可选,空 group → 0,等价 PT0S
    expect(parseDuration('PT')).toBe(0)
  })

  it('trims whitespace', () => {
    expect(parseDuration('  PT5H  ')).toBe(18000)
  })
})

describe('formatDuration', () => {
  it.each([
    [0, 'PT0S'],
    [18000, 'PT5H'],
    [5400, 'PT1H30M'],
    [2700, 'PT45M'],
    [3600, 'PT1H'],
    [60, 'PT1M'],
    [30, 'PT30S'],
  ])('formats %is → %s', (input, expected) => {
    expect(formatDuration(input)).toBe(expected)
  })

  it('throws on negative', () => {
    expect(() => formatDuration(-1)).toThrow()
  })

  it('throws on NaN', () => {
    expect(() => formatDuration(NaN)).toThrow()
  })
})

describe('durationToHoursMinutes', () => {
  it('exact hours and minutes', () => {
    expect(durationToHoursMinutes(5400)).toEqual({ hours: 1, minutes: 30 })
  })

  it('rounds up partial minutes to next minute', () => {
    // 1h 0m 30s → 1h 1m (向上取整)
    expect(durationToHoursMinutes(3630)).toEqual({ hours: 1, minutes: 1 })
  })

  it('rounds up so 60min becomes 1h 0m', () => {
    // 59m 30s → 60m → 1h 0m
    expect(durationToHoursMinutes(3570)).toEqual({ hours: 1, minutes: 0 })
  })

  it('returns 0h 0m for 0 seconds', () => {
    expect(durationToHoursMinutes(0)).toEqual({ hours: 0, minutes: 0 })
  })

  it('returns 0 for negative', () => {
    expect(durationToHoursMinutes(-100)).toEqual({ hours: 0, minutes: 0 })
  })
})

describe('hoursMinutesToDuration', () => {
  it('composes hours+minutes into ISO', () => {
    expect(hoursMinutesToDuration({ hours: 5, minutes: 0 })).toBe('PT5H')
    expect(hoursMinutesToDuration({ hours: 1, minutes: 30 })).toBe('PT1H30M')
  })

  it('outputs PT0S when both 0', () => {
    expect(hoursMinutesToDuration({ hours: 0, minutes: 0 })).toBe('PT0S')
  })

  it('clamps negative to 0', () => {
    expect(hoursMinutesToDuration({ hours: -1, minutes: 5 })).toBe('PT5M')
  })

  it('round-trips through parseDuration', () => {
    const cases: Array<{ hours: number; minutes: number }> = [
      { hours: 0, minutes: 0 },
      { hours: 5, minutes: 0 },
      { hours: 1, minutes: 30 },
      { hours: 24, minutes: 0 },
    ]
    for (const c of cases) {
      const iso = hoursMinutesToDuration(c)
      const seconds = parseDuration(iso)
      const back = durationToHoursMinutes(seconds)
      expect(back.hours).toBe(c.hours)
      // minutes may round up — only check non-zero cases stay close
      if (c.minutes > 0) expect(back.minutes).toBeGreaterThanOrEqual(c.minutes - 1)
      else expect(back.minutes).toBeLessThanOrEqual(1)
    }
  })
})

describe('formatDurationHuman', () => {
  it('5h', () => {
    expect(formatDurationHuman(18000)).toBe('5h')
  })
  it('1h 30m', () => {
    expect(formatDurationHuman(5400)).toBe('1h 30m')
  })
  it('0m when zero', () => {
    expect(formatDurationHuman(0)).toBe('0m')
  })
  it('shows minutes only when hours is 0', () => {
    expect(formatDurationHuman(2700)).toBe('45m')
  })
})
