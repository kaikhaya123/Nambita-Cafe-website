// Display formatting shared by server and client dashboard components.

export type ValueKind = 'currency' | 'count'

export function formatRand(value: number) {
  return `R${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatCount(value: number) {
  return value.toLocaleString('en-US')
}

// Compact form for axis ticks: R0 / R500 / R1.5K / R12K
export function formatCompact(value: number, kind: ValueKind) {
  const prefix = kind === 'currency' ? 'R' : ''
  if (value >= 1000) {
    const thousands = value / 1000
    return `${prefix}${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}K`
  }
  return `${prefix}${Math.round(value)}`
}

export function formatValue(value: number, kind: ValueKind) {
  return kind === 'currency' ? formatRand(value) : formatCount(value)
}

/** "2 Oct 2026, 14:05" in South African time, whatever time zone the server or browser is in. */
export function formatDateTime(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Johannesburg',
  })
}

export function formatMinutes(minutes: number | null) {
  if (minutes === null) return '—'
  // Round first so e.g. 119.7 shows as "2h 0m", not "1h 60m".
  const rounded = Math.round(minutes)
  if (rounded < 60) return `${rounded} min`
  return `${Math.floor(rounded / 60)}h ${rounded % 60}m`
}
