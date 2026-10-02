// Order details page (URL: /dashboard/history/NC-2026-0005). Open to staff and managers.
// Reached from the Order History list or by tapping an order on the kitchen board.

import { notFound, redirect } from 'next/navigation'
import DashboardShell from '@/components/dashboard/DashboardShell'
import OrderDetailsView from '@/components/dashboard/history/OrderDetailsView'
import { ReportError } from '@/components/dashboard/analytics/ReportParts'
import { getOrderDetails, type OrderDetails } from '@/lib/order-history'
import { getStaffSession } from '@/lib/staff-auth'

export default async function OrderDetailsPage({ params }: Readonly<{ params: Promise<{ orderNumber: string }> }>) {
  const session = await getStaffSession()
  if (!session) redirect('/nambita-staff-access')

  const { orderNumber } = await params

  let order: OrderDetails | null = null
  let failed = false
  try {
    order = await getOrderDetails(decodeURIComponent(orderNumber))
  } catch (error) {
    console.error('Failed to load order details', error)
    failed = true
  }
  if (!failed && !order) notFound()

  return (
    <DashboardShell role={session.role} staffName={session.name} persistentNav title="Order Details">
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        {order ? <OrderDetailsView order={order} /> : <ReportError />}
      </main>
    </DashboardShell>
  )
}
