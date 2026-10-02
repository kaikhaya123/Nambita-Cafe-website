// Tests the shared display-formatting helpers.

import { describe, expect, it } from 'vitest'
import { formatCompact, formatMinutes, formatRand } from './format'

describe('formatRand', () => {
  it('formats rand values with grouping and two decimal places', () => {
    expect(formatRand(1234.5)).toBe('R1,234.50')
  })
})

describe('formatCompact', () => {
  it('formats compact currency and count values', () => {
    expect(formatCompact(1500, 'currency')).toBe('R1.5K')
    expect(formatCompact(1000, 'count')).toBe('1K')
  })
})

describe('formatMinutes', () => {
  it('rounds before converting minutes to hours', () => {
    expect(formatMinutes(119.7)).toBe('2h 0m')
  })

  it('shows a dash when the value is unavailable', () => {
    expect(formatMinutes(null)).toBe('—')
  })
})