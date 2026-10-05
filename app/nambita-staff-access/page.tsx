// Dashboard login (URL: /nambita-staff-access): choose Staff or Manager, type your name and that role's password.
// The page doesn't load the staff list, so it never reveals who works here.

import LoginForm from '@/components/dashboard/auth/LoginForm'

export default function StaffLoginPage() {
  return <LoginForm />
}
