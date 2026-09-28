// Menu performance report (URL: /dashboard/menu-performance). Managers only. Numbers come from lib/analytics.ts.

import { redirect } from 'next/navigation'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { BarList, Card, ReportError, ReportHeader, StatTile } from '@/components/dashboard/analytics/ReportParts'
import { getMenuReport, parseRange, type MenuReport } from '@/lib/analytics'
import { formatCount, formatRand } from '@/lib/format'
import { getStaffSession } from '@/lib/staff-auth'

const TOP_ITEMS = 10

export default async function MenuPerformancePage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ range?: string }> }>) {
  const session = await getStaffSession()
  if (!session) redirect('/nambita-staff-access')
  if (session.role !== 'manager') redirect('/dashboard')

  const range = parseRange((await searchParams).range)

  let report: MenuReport | null = null
  try {
    report = await getMenuReport(range)
  } catch (error) {
    console.error('Failed to build menu report', error)
  }

  const bestSeller = report?.items[0]
  const topEarner = report ? [...report.items].sort((a, b) => b.revenue - a.revenue)[0] : undefined

  return (
    <DashboardShell role={session.role} staffName={session.name} persistentNav title="Performance">
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <ReportHeader title="Performance" range={range} basePath="/dashboard/menu-performance" />

        {report ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatTile icon="star" label="Best seller" value={bestSeller?.name ?? '—'}>
                {bestSeller && <p className="mt-1 text-xs text-black-900/50">{formatCount(bestSeller.quantity)} sold</p>}
              </StatTile>
              <StatTile icon="banknote" label="Top earner" value={topEarner?.name ?? '—'}>
                {topEarner && <p className="mt-1 text-xs text-black-900/50">{formatRand(topEarner.revenue)} revenue</p>}
              </StatTile>
              <StatTile icon="grid" label="Different items sold" value={formatCount(report.items.length)}>
                <p className="mt-1 text-xs text-black-900/50">across {formatCount(report.totalOrders)} orders</p>
              </StatTile>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card icon="bag" title="Most ordered items" subtitle={`Top ${TOP_ITEMS} by quantity sold`}>
                <BarList
                  kind="count"
                  emptyMessage="No items sold in this period"
                  rows={report.items.slice(0, TOP_ITEMS).map((item) => ({
                    key: item.id,
                    label: item.name,
                    value: item.quantity,
                    detail: formatRand(item.revenue),
                  }))}
                />
              </Card>

              <Card icon="chart" title="Top earning items" subtitle={`Top ${TOP_ITEMS} by revenue, including add-ons`}>
                <BarList
                  kind="currency"
                  emptyMessage="No items sold in this period"
                  rows={[...report.items]
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, TOP_ITEMS)
                    .map((item) => ({
                      key: item.id,
                      label: item.name,
                      value: item.revenue,
                      detail: `${formatCount(item.quantity)} sold`,
                    }))}
                />
              </Card>
            </div>

            <Card icon="plus" title="Popular add-ons" subtitle="How often each add-on was chosen">
              <BarList
                kind="count"
                emptyMessage="No add-ons ordered in this period"
                rows={report.addOns.map((addOn) => ({
                  key: addOn.name,
                  label: addOn.name,
                  value: addOn.quantity,
                  detail: formatRand(addOn.revenue),
                }))}
              />
            </Card>
          </>
        ) : (
          <ReportError />
        )}
      </main>
    </DashboardShell>
  )
}
