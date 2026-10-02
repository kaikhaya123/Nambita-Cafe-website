// Team page (URL: /dashboard/team). Managers only: add people and deactivate/reactivate them.
// Staff log in with STAFF_DASHBOARD_PASSWORD and managers with MANAGER_DASHBOARD_PASSWORD.

import { redirect } from 'next/navigation'
import DashboardShell from '@/components/dashboard/DashboardShell'
import TeamManager from '@/components/dashboard/team/TeamManager'
import { ReportError } from '@/components/dashboard/analytics/ReportParts'
import { listAccounts, summarize, type StaffAccountSummary } from '@/lib/staff-accounts'
import { getStaffSession } from '@/lib/staff-auth'

export default async function TeamPage() {
  const session = await getStaffSession()
  if (!session) redirect('/nambita-staff-access')
  if (session.role !== 'manager') redirect('/dashboard')

  let accounts: StaffAccountSummary[] | null = null
  try {
    accounts = (await listAccounts()).map(summarize)
  } catch (error) {
    console.error('Failed to load team', error)
  }

  return (
    <DashboardShell role={session.role} staffName={session.name} persistentNav title="Team">
      <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        <h1 className="text-center font-teko text-4xl uppercase leading-none tracking-[0.03em] sm:text-5xl lg:sr-only">
          Team
        </h1>
        {accounts ? <TeamManager initialAccounts={accounts} currentAccountId={session.accountId} /> : <ReportError />}
      </main>
    </DashboardShell>
  )
}
