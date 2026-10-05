// Building blocks for the report pages: date-range tabs, cards, stat tiles, bar lists.

import Link from 'next/link'
import { reportRanges, type ReportRangeKey } from '@/lib/analytics'
import { formatValue, type ValueKind } from '@/lib/format'
import { ReportIcon, type ReportIconName } from './ReportIcons'

export function ReportHeader({
  title,
  range,
  basePath,
}: Readonly<{ title: string; range: ReportRangeKey; basePath: string }>) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      {/* On large screens the title shows in the header bar, so it's only kept here for screen readers. */}
      <h1 className="font-teko text-4xl uppercase leading-none tracking-[0.03em] sm:text-5xl lg:sr-only">{title}</h1>
      <nav aria-label="Date range" className="flex gap-1 rounded-full border border-black-900/25 bg-white p-1">
        {(Object.keys(reportRanges) as ReportRangeKey[]).map((key) => (
          <Link
            key={key}
            href={`${basePath}?range=${key}`}
            aria-current={key === range ? 'page' : undefined}
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.08em] ${
              key === range ? 'bg-black-900 text-white' : 'text-black-900/80 hover:text-black-900'
            }`}
          >
            {reportRanges[key].label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

export function Card({
  title,
  subtitle,
  icon,
  children,
}: Readonly<{ title?: string; subtitle?: string; icon?: ReportIconName; children: React.ReactNode }>) {
  return (
    <section className="rounded-2xl border border-black-900/20 bg-white p-5 sm:p-6">
      {title && (
        <h2 className="flex items-center gap-2 text-sm font-bold text-black-900">
          {icon && <ReportIcon name={icon} className="h-4 w-4 text-black-900/80" />}
          {title}
        </h2>
      )}
      {subtitle && <p className={`mt-0.5 text-xs text-black-900/80 ${icon ? 'pl-6' : ''}`}>{subtitle}</p>}
      <div className={title ? 'mt-5' : ''}>{children}</div>
    </section>
  )
}

// Signed % change vs the previous period, with an arrow so direction never relies on color alone.
export function Delta({ current, previous, label }: Readonly<{ current: number; previous: number; label: string }>) {
  if (previous === 0) {
    return <p className="mt-1 text-xs text-black-900/80">{current > 0 ? `New ${label}` : `No change ${label}`}</p>
  }
  const change = ((current - previous) / previous) * 100
  const rounded = Math.round(change)
  let tone = 'text-black-900/80'
  let arrow = '→'
  if (rounded > 0) {
    tone = 'text-brand-green'
    arrow = '▲'
  } else if (rounded < 0) {
    tone = 'text-red-700'
    arrow = '▼'
  }
  return (
    <p className={`mt-1 text-xs font-bold ${tone}`}>
      {arrow} {rounded > 0 ? '+' : ''}
      {rounded}% <span className="font-normal text-black-900/80">{label}</span>
    </p>
  )
}

export function StatTile({
  label,
  value,
  icon,
  children,
}: Readonly<{ label: string; value: string; icon?: ReportIconName; children?: React.ReactNode }>) {
  return (
    <div className="rounded-2xl border border-black-900/20 bg-white p-5">
      <div className="flex items-center gap-2.5">
        {icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-yellow text-black-900">
            <ReportIcon name={icon} className="h-[18px] w-[18px]" />
          </span>
        )}
        <p className="text-xs text-black-900/80">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-bold text-black-900">{value}</p>
      {children}
    </div>
  )
}

// Horizontal bars that double as the table view: every row shows its exact values as text.
export function BarList({
  rows,
  kind,
  emptyMessage,
}: Readonly<{
  rows: { key: string; label: string; value: number; detail?: string }[]
  kind: ValueKind
  emptyMessage: string
}>) {
  const max = Math.max(0, ...rows.map((r) => r.value))
  if (rows.length === 0 || max === 0) {
    return <p className="py-6 text-center text-sm text-black-900/80">{emptyMessage}</p>
  }
  return (
    <ul className="space-y-4">
      {rows.map((row) => (
        <li key={row.key}>
          <div className="flex items-baseline justify-between gap-4 text-sm">
            <span className="truncate font-bold text-black-900">{row.label}</span>
            <span className="shrink-0 tabular-nums text-black-900">
              {formatValue(row.value, kind)}
              {row.detail && <span className="ml-2 text-xs text-black-900/80">{row.detail}</span>}
            </span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-black-900/5">
            <div className="h-2 rounded-full bg-black-900" style={{ width: `${(row.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function ReportError() {
  return (
    <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-center text-sm font-bold text-red-800">
      Could not load report data. Check the Supabase connection and try again.
    </div>
  )
}
