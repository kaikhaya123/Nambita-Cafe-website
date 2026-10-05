// Tests the shared display-formatting helpers.

import { describe, expect, it } from 'vitest'
import { formatCompact, formatDate, formatMinutes, formatRand, formatTime } from './format'

describe('formatDate and formatTime', () => {
  // 05:04 UTC is 07:04 in South Africa.
  const placed = '2026-09-30T05:04:00Z'

  it('shows the date in South African time', () => {
    expect(formatDate(placed)).toMatch(/^30 Sept? 2026$/)
  })

  it('shows a 24-hour time in South African time', () => {
    expect(formatTime(placed)).toBe('07:04')
  })
})

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