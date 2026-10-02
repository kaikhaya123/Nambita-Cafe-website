// Staff login (URL: /nambita-staff-access): choose your name and enter your password.
// Staff are then logged in; managers go on to step 2, the authenticator code (./verify).

import LoginForm from '@/components/dashboard/auth/LoginForm'
import { listAccounts, summarize, type StaffAccountSummary } from '@/lib/staff-accounts'

// Load the staff list fresh on every visit. Without this, Next.js would build the page once
// and new team members wouldn't appear in the name list until the next deploy.
export const dynamic = 'force-dynamic'

export default async function StaffLoginPage() {
  let accounts: StaffAccountSummary[] | null = null
  try {
    accounts = (await listAccounts()).filter((a) => a.is_active).map(summarize)
  } catch (error) {
    console.error('Failed to load accounts for login', error)
  }

  return <LoginForm accounts={accounts} />
}
