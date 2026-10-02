'use client'

// Staff login form: role, name and password. Staff are logged straight in;
// managers go on to the authenticator-code page next.

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { StaffAccountSummary, StaffRole } from '@/lib/staff-accounts'
import { AuthCard, FormError, inputClass, labelClass, primaryButtonClass, Select } from './AuthCard'

const roleOptions: { value: StaffRole; label: string }[] = [
  { value: 'staff', label: 'Staff' },
  { value: 'manager', label: 'Manager' },
]

export default function LoginForm({ accounts }: Readonly<{ accounts: StaffAccountSummary[] | null }>) {
  const router = useRouter()
  const [role, setRole] = useState<StaffRole>('staff')
  const [accountId, setAccountId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedRole = roleOptions.find((option) => option.value === role) ?? roleOptions[0]
  const people = (accounts ?? []).filter((account) => account.role === role)
  const selectedAccount = people.find((account) => account.id === accountId)
  const needsSetup = selectedAccount !== undefined && !selectedAccount.isSetUp
  // Only managers use an authenticator app (same rule as usesAuthenticator in lib/staff-accounts.ts).
  const isManager = role === 'manager'

  function chooseRole(next: StaffRole) {
    setRole(next)
    setAccountId('')
    setPassword('')
    setError(null)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/staff/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, accountId, password }),
      })
      const data = (await response.json().catch(() => null)) as { error?: string; next?: string } | null
      if (!response.ok || !data?.next) throw new Error(data?.error ?? 'Could not sign in.')
      // Password is right. Staff are now logged in and go to the dashboard;
      // managers go to the separate authenticator-code page.
      router.replace(data.next)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.')
      setPassword('')
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard title={`${selectedRole.label} Login`} onSubmit={handleSubmit}>
      <div
        role="radiogroup"
        aria-label="Log in as"
        className="mt-4 grid grid-cols-2 gap-1 rounded-full border border-black-900 bg-white p-1"
      >
        {roleOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={option.value === role}
            onClick={() => chooseRole(option.value)}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition-colors ${
              option.value === role ? 'bg-black-900 text-white' : 'text-black-900/60 hover:text-black-900'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {accounts === null ? (
        <p role="alert" className="mt-6 rounded-lg bg-red-50 p-4 text-center text-sm font-bold text-red-800">
          Can’t reach the staff list. Check the Supabase connection and that the staff accounts migration has been run.
        </p>
      ) : (
        <>
          <label htmlFor="login-name" className={`${labelClass} mt-6`}>
            Your name
          </label>
          <Select id="login-name" value={accountId} onChange={setAccountId} placeholder="Select your name">
            {people.map((account) => (
              <option key={account.id} value={account.id} className="text-black-900">
                {account.name}
              </option>
            ))}
          </Select>

          {needsSetup && !isManager && (
            <div className="mt-6 rounded-lg border border-black-900/15 bg-brand-offwhite p-4 text-sm">
              <p className="font-bold">Staff login isn’t switched on yet.</p>
              <p className="mt-1 text-black-900/60">Ask HQ (a manager) to set the staff password, then log in here.</p>
            </div>
          )}
          {needsSetup && isManager && (
            <div className="mt-6 rounded-lg border border-black-900/15 bg-brand-offwhite p-4 text-sm">
              <p className="font-bold">{selectedAccount.name} hasn’t set up their login yet.</p>
              <p className="mt-1 text-black-900/60">Ask another manager for a setup code, then set your password and authenticator.</p>
              <Link
                href={`/dashboard/setup?account=${selectedAccount.id}`}
                className="mt-3 inline-block font-bold underline underline-offset-2"
              >
                Set up my login →
              </Link>
            </div>
          )}
          {!needsSetup && (
            <>
              <label htmlFor="login-password" className={labelClass}>
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClass}
              />

              <FormError message={error} />

              <button type="submit" disabled={isSubmitting || !accountId || !password} className={primaryButtonClass}>
                {isSubmitting ? 'Checking…' : isManager ? 'Continue' : 'Log In'}
              </button>
              {isManager && (
                <p className="mt-3 text-center text-xs text-black-900/50">
                  Next, you’ll enter the code from your authenticator app.
                </p>
              )}
            </>
          )}
        </>
      )}

      {isManager ? (
        <p className="mt-6 text-center text-xs text-black-900/60">
          New manager or have a setup code?{' '}
          <Link href="/dashboard/setup" className="font-bold text-black-900 underline underline-offset-2">
            Set up your login
          </Link>
        </p>
      ) : (
        <p className="mt-6 text-center text-xs text-black-900/60">
          Staff use the shared staff password from HQ. Don’t know it? Ask a manager.
        </p>
      )}
    </AuthCard>
  )
}
