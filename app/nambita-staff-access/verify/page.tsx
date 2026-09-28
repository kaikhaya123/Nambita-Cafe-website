import { redirect } from 'next/navigation'
import VerifyCodeForm from '@/components/dashboard/auth/VerifyCodeForm'
import { getPendingLogin } from '@/lib/staff-auth'

// Login step 2. Only reachable for 5 minutes after a correct password.
export default async function LoginVerifyPage() {
  const pending = await getPendingLogin()
  if (!pending) redirect('/nambita-staff-access')

  return <VerifyCodeForm name={pending.name} />
}
