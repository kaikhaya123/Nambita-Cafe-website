// Login setup page (URL: /dashboard/setup). New staff enter the setup code a manager gave them,
// then choose a password and link an authenticator app. Also used once to create the very first manager.

import SetupForm from '@/components/dashboard/auth/SetupForm'
import { hasActiveManager, listAccounts, summarize, type StaffAccountSummary } from '@/lib/staff-accounts'

export default async function StaffSetupPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ account?: string }> }>) {
  let accounts: StaffAccountSummary[] | null = null
  let firstManagerAvailable = false
  try {
    accounts = (await listAccounts()).filter((a) => a.is_active).map(summarize)
    firstManagerAvailable = Boolean(process.env.MANAGER_DASHBOARD_PASSWORD) && !(await hasActiveManager())
  } catch (error) {
    console.error('Failed to load accounts for setup', error)
  }

  const { account } = await searchParams

  return <SetupForm accounts={accounts} firstManagerAvailable={firstManagerAvailable} initialAccountId={account ?? ''} />
}
