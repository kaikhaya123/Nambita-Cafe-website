// Manager login setup page (URL: /dashboard/setup). New managers enter the setup code another manager
// gave them, then choose a password and link an authenticator app. Also used once to create the very
// first manager. Staff don't use this page: HQ gives them a password from the Team page.

import SetupForm from '@/components/dashboard/auth/SetupForm'
import { hasActiveManager, listAccounts, summarize, usesAuthenticator, type StaffAccountSummary } from '@/lib/staff-accounts'

export default async function StaffSetupPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ account?: string }> }>) {
  let accounts: StaffAccountSummary[] | null = null
  let firstManagerAvailable = false
  try {
    accounts = (await listAccounts()).filter((a) => a.is_active && usesAuthenticator(a.role)).map(summarize)
    firstManagerAvailable = Boolean(process.env.MANAGER_DASHBOARD_PASSWORD) && !(await hasActiveManager())
  } catch (error) {
    console.error('Failed to load accounts for setup', error)
  }

  const { account } = await searchParams

  return <SetupForm accounts={accounts} firstManagerAvailable={firstManagerAvailable} initialAccountId={account ?? ''} />
}
