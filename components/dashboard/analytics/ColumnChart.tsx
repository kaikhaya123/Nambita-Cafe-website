'use client'

// Simple bar chart used on the Sales report (revenue by hour or by day).

import { useState } from 'react'
import { formatCompact, formatCount, formatValue, type ValueKind } from '@/lib/format'

interface Point {
  label: string
  value: number
  orders: number
}

interface Props {
  points: Point[]
  kind: ValueKind
  /** Show every Nth x-axis label so they never collide. */
  labelEvery?: number
  emptyMessage?: string
}

const CHART_HEIGHT = 200

// Rounds the axis top up to a clean step (1, 2, 2.5, 5 × 10^n) with four intervals.
function niceTicks(max: number) {
  if (max <= 0) return [0, 1, 2, 3, 4]
  const rawStep = max / 4
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rawStep) ?? rawStep
  return [0, 1, 2, 3, 4].map((i) => i * step)
}

export default function ColumnChart({ points, kind, labelEvery = 1, emptyMessage = 'No sales in this period' }: Readonly<Props>) {
  const [active, setActive] = useState<number | null>(null)
  const ticks = niceTicks(Math.max(...points.map((p) => p.value)))
  const top = ticks[ticks.length - 1]
  const isEmpty = points.every((p) => p.value === 0)

  // On phones, more than 6 labels collide, so show every other one.
  const visibleLabels = Math.ceil(points.length / labelEvery)
  const hideOnPhone = (index: number) => visibleLabels > 6 && (index / labelEvery) % 2 === 1

  return (
    // Top padding leaves room for the highest tick label, which is centered on its gridline.
    <div className="relative pt-3">
      <div className="flex">
        {/* Y axis */}
        <div className="relative mr-2 w-12 shrink-0" style={{ height: CHART_HEIGHT }} aria-hidden>
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute right-0 -translate-y-1/2 text-[11px] tabular-nums text-black-900/80"
              style={{ bottom: `${(tick / top) * 100}%` }}
            >
              {formatCompact(tick, kind)}
            </span>
          ))}
        </div>

        <div className="relative flex-1">
          {/* Gridlines */}
          <div className="absolute inset-x-0 top-0" style={{ height: CHART_HEIGHT }} aria-hidden>
            {ticks.map((tick) => (
              <div
                key={tick}
                className={`absolute inset-x-0 h-px ${tick === 0 ? 'bg-black-900/40' : 'bg-black-900/10'}`}
                style={{ bottom: `${(tick / top) * 100}%` }}
              />
            ))}
          </div>

          {/* Columns */}
          <div className="relative flex items-end" style={{ height: CHART_HEIGHT }} onMouseLeave={() => setActive(null)}>
            {points.map((point, index) => {
              const height = (point.value / top) * CHART_HEIGHT
              return (
                <button
                  key={point.label}
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  onBlur={() => setActive(null)}
                  aria-label={`${point.label}: ${formatValue(point.value, kind)}, ${formatCount(point.orders)} orders`}
                  // The keyboard focus ring goes round the whole column, so it shows even on a day with no sales.
                  className="relative flex h-full flex-1 items-end justify-center rounded-sm px-[1px] outline-none focus-visible:ring-2 focus-visible:ring-black-900"
                >
                  <span
                    className={`block w-full max-w-[24px] rounded-t transition-opacity ${
                      active !== null && active !== index ? 'opacity-50' : ''
                    } ${point.value > 0 ? 'bg-black-900' : ''}`}
                    style={{ height: point.value > 0 ? Math.max(height, 2) : 0 }}
                  />
                </button>
              )
            })}
          </div>

          {/* X axis labels */}
          <div className="mt-2 flex" aria-hidden>
            {points.map((point, index) => (
              <span
                key={point.label}
                className={`flex-1 whitespace-nowrap text-center text-[11px] tabular-nums text-black-900/80 ${
                  hideOnPhone(index) ? 'max-sm:invisible' : ''
                }`}
              >
                {index % labelEvery === 0 ? point.label : ''}
              </span>
            ))}
          </div>

          {/* Tooltip */}
          {active !== null && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-black-900 px-3 py-2 text-xs text-white shadow-lg"
              style={{
                left: `${((active + 0.5) / points.length) * 100}%`,
                top: CHART_HEIGHT - (points[active].value / top) * CHART_HEIGHT - 8,
              }}
            >
              <p className="font-bold">{points[active].label}</p>
              <p>{formatValue(points[active].value, kind)}</p>
              <p className="text-white/80">
                {formatCount(points[active].orders)} order{points[active].orders === 1 ? '' : 's'}
              </p>
            </div>
          )}

          {isEmpty && (
            <p
              className="absolute inset-x-0 top-0 flex items-center justify-center text-sm text-black-900/80"
              style={{ height: CHART_HEIGHT }}
            >
              <span className="bg-white px-3">{emptyMessage}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
