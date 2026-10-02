// Kitchen orders board (URL: /dashboard). Staff must be logged in; the board itself is components/dashboard/orders/OrdersBoard.tsx.

import { redirect } from 'next/navigation'
import OrdersBoard from '@/components/dashboard/orders/OrdersBoard'
import { getStaffSession } from '@/lib/staff-auth'

export default async function DashboardPage() {
  const session = await getStaffSession()
  if (!session) {
    redirect('/nambita-staff-access')
  }

  return <OrdersBoard role={session.role} staffName={session.name} />
}
