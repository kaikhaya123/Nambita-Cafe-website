// Sales report (URL: /dashboard/sales?range=today|7d|30d). Open to staff and managers. Numbers come from lib/analytics.ts.

import { redirect } from 'next/navigation'
import DashboardShell from '@/components/dashboard/DashboardShell'
import ColumnChart from '@/components/dashboard/analytics/ColumnChart'
import { BarList, Card, Delta, ReportError, ReportHeader, StatTile } from '@/components/dashboard/analytics/ReportParts'
import { getSalesReport, parseRange, reportRanges, type SalesReport } from '@/lib/analytics'
import { formatCount, formatMinutes, formatRand } from '@/lib/format'
import { getStaffSession } from '@/lib/staff-auth'

export default async function SalesPage({ searchParams }: Readonly<{ searchParams: Promise<{ range?: string }> }>) {
  const session = await getStaffSession()
  // Open to staff and managers.
  if (!session) redirect('/nambita-staff-access')

  const range = parseRange((await searchParams).range)
  const { compareLabel, days } = reportRanges[range]

  let report: SalesReport | null = null
  try {
    report = await getSalesReport(range)
  } catch (error) {
    console.error('Failed to build sales report', error)
  }

  return (
    <DashboardShell role={session.role} staffName={session.name} persistentNav title="Sales">
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <ReportHeader title="Sales" range={range} basePath="/dashboard/sales" />

        {report ? (
          <>
            <Card>
              <p className="text-sm text-black-900/80">Revenue · {reportRanges[range].label.toLowerCase()}</p>
              <p className="mt-1 text-5xl font-bold text-black-900 sm:text-6xl">{formatRand(report.revenue)}</p>
              <Delta current={report.revenue} previous={report.previousRevenue} label={compareLabel} />
            </Card>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              <StatTile icon="receipt" label="Orders" value={formatCount(report.orders)}>
                <Delta current={report.orders} previous={report.previousOrders} label={compareLabel} />
              </StatTile>
              <StatTile
                icon="banknote"
                label="Average order value"
                value={report.averageOrderValue === null ? '—' : formatRand(report.averageOrderValue)}
              />
              <StatTile icon="bag" label="Items sold" value={formatCount(report.itemsSold)} />
              <StatTile icon="timer" label="Avg time to ready" value={formatMinutes(report.avgPrepMinutes)}>
                <p className="mt-1 text-xs text-black-900/80">Order placed → ready</p>
              </StatTile>
              <StatTile icon="hourglass" label="Avg wait at counter" value={formatMinutes(report.avgCollectionWaitMinutes)}>
                <p className="mt-1 text-xs text-black-900/80">Ready → collected</p>
              </StatTile>
            </div>

            {days > 1 && (
              <Card icon="calendar" title="Revenue by day" subtitle="Paid orders, South African time">
                <ColumnChart
                  kind="currency"
                  labelEvery={days > 7 ? 5 : 1}
                  points={report.byDay.map((p) => ({ label: p.label, value: p.revenue, orders: p.orders }))}
                />
              </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <Card
                icon="chart"
                title={days > 1 ? 'Busiest hours' : 'Revenue by hour'}
                subtitle={days > 1 ? 'Revenue by hour of day, all days combined' : 'Paid orders, South African time'}
              >
                <ColumnChart
                  kind="currency"
                  labelEvery={3}
                  points={report.byHour.map((p) => ({ label: p.label, value: p.revenue, orders: p.orders }))}
                />
              </Card>

              <Card icon="store" title="Revenue by branch">
                <BarList
                  kind="currency"
                  emptyMessage="No sales in this period"
                  rows={report.byBranch.map((b) => ({
                    key: b.id,
                    label: b.name,
                    value: b.revenue,
                    detail: `${formatCount(b.orders)} order${b.orders === 1 ? '' : 's'}`,
                  }))}
                />
              </Card>
            </div>
          </>
        ) : (
          <ReportError />
        )}
      </main>
    </DashboardShell>
  )
}
