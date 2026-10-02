// Order History page (URL: /dashboard/history?q=...&page=...). Open to staff and managers.
// Lists paid orders, newest first; the list itself is components/dashboard/history/OrderHistoryList.tsx.

import { redirect } from 'next/navigation'
import DashboardShell from '@/components/dashboard/DashboardShell'
import OrderHistoryList from '@/components/dashboard/history/OrderHistoryList'
import { ReportError } from '@/components/dashboard/analytics/ReportParts'
import { listOrderHistory, type OrderHistoryRow } from '@/lib/order-history'
import { getStaffSession } from '@/lib/staff-auth'

export default async function OrderHistoryPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ q?: string; page?: string }> }>) {
  const session = await getStaffSession()
  if (!session) redirect('/nambita-staff-access')

  const params = await searchParams
  const search = (params.q ?? '').slice(0, 60)
  const page = Math.max(1, Math.floor(Number(params.page)) || 1)

  let result: { rows: OrderHistoryRow[]; total: number } | null = null
  try {
    result = await listOrderHistory(search, page)
  } catch (error) {
    console.error('Failed to load order history', error)
  }

  return (
    <DashboardShell role={session.role} staffName={session.name} persistentNav title="Order History">
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <h1 className="text-center font-teko text-4xl uppercase leading-none tracking-[0.03em] sm:text-5xl lg:sr-only">
          Order History
        </h1>
        {result ? <OrderHistoryList rows={result.rows} total={result.total} page={page} search={search} /> : <ReportError />}
      </main>
    </DashboardShell>
  )
}
