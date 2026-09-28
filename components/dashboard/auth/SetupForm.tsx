'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { StaffAccountSummary } from '@/lib/staff-accounts'
import { AuthCard, CodeInput, FormError, inputClass, labelClass, primaryButtonClass, Select } from './AuthCard'

// Keep in sync with MIN_PASSWORD_LENGTH in lib/security/password.ts (that file is server-only,
// so it can't be imported here). The server is what actually enforces it.
const MIN_PASSWORD_LENGTH = 8

interface Enrollment {
  setupToken: string
  accountName: string
  qrDataUrl: string
  manualKey: string
}

interface Props {
  accounts: StaffAccountSummary[] | null
  firstManagerAvailable: boolean
  initialAccountId: string
}

async function postJson<T>(url: string, body: object): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = (await response.json().catch(() => null)) as (T & { error?: string }) | null
  if (!response.ok || !data) throw new Error(data?.error ?? 'Something went wrong. Please try again.')
  return data
}

export default function SetupForm({ accounts, firstManagerAvailable, initialAccountId }: Readonly<Props>) {
  const router = useRouter()
  const [isFirstManager, setIsFirstManager] = useState(false)

  // Step 1
  const [accountId, setAccountId] = useState(initialAccountId)
  const [setupCode, setSetupCode] = useState('')
  const [name, setName] = useState('')
  const [managerPassword, setManagerPassword] = useState('')

  // Step 2
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const people = accounts ?? []
  const passwordsMatch = password.length > 0 && password === confirmPassword

  async function startSetup(event: React.FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await postJson<Enrollment>(
        '/api/staff/setup/start',
        isFirstManager ? { firstManager: true, name, managerPassword } : { accountId, setupCode }
      )
      setEnrollment(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start setup.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function finishSetup(event: React.FormEvent) {
    event.preventDefault()
    if (!enrollment) return
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await postJson<{ role: string }>('/api/staff/setup/complete', {
        setupToken: enrollment.setupToken,
        password,
        confirmPassword,
        code,
      })
      router.replace(result.role === 'manager' ? '/dashboard/sales' : '/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not finish setup.')
      setCode('')
      setIsSubmitting(false)
    }
  }

  if (enrollment) {
    return (
      <AuthCard title="Secure Your Login" onSubmit={finishSetup}>
        <p className="mt-1 text-center text-sm text-black-900/60">Setting up {enrollment.accountName}</p>

        <ol className="mt-6 space-y-6 text-sm">
          <li>
            <p className="font-bold">1. Scan with your authenticator app</p>
            <p className="mt-1 text-black-900/60">
              Use Google Authenticator, Microsoft Authenticator or similar. Tap “+” then “Scan a QR code”.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL generated on the server */}
            <img
              src={enrollment.qrDataUrl}
              alt="QR code for your authenticator app"
              width={200}
              height={200}
              className="mx-auto mt-4 rounded-lg border border-black-900/10"
            />
            <details className="mt-3 text-xs text-black-900/60">
              <summary className="cursor-pointer font-bold text-black-900">Can’t scan? Enter this key instead</summary>
              <p className="mt-2 select-all break-all rounded bg-brand-offwhite p-3 font-mono text-sm text-black-900">
                {enrollment.manualKey}
              </p>
            </details>
          </li>

          <li>
            <p className="font-bold">2. Choose your password</p>
            <label htmlFor="setup-password" className={labelClass}>
              New password
            </label>
            <input
              id="setup-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
            />
            <p className={`mt-1.5 text-xs ${password.length >= MIN_PASSWORD_LENGTH ? 'text-brand-green' : 'text-black-900/50'}`}>
              At least {MIN_PASSWORD_LENGTH} characters{password.length >= MIN_PASSWORD_LENGTH ? ' ✓' : ''}
            </p>

            <label htmlFor="setup-confirm" className={labelClass}>
              Confirm password
            </label>
            <input
              id="setup-confirm"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={inputClass}
            />
            {confirmPassword.length > 0 && (
              <p className={`mt-1.5 text-xs ${passwordsMatch ? 'text-brand-green' : 'text-red-700'}`}>
                {passwordsMatch ? 'Passwords match ✓' : 'Passwords don’t match yet'}
              </p>
            )}
          </li>

          <li>
            <p className="font-bold">3. Confirm with your authenticator</p>
            <label htmlFor="setup-code" className={labelClass}>
              6-digit code from the app
            </label>
            <CodeInput id="setup-code" value={code} onChange={setCode} />
          </li>
        </ol>

        <FormError message={error} />

        <button
          type="submit"
          disabled={isSubmitting || password.length < MIN_PASSWORD_LENGTH || !passwordsMatch || code.length !== 6}
          className={primaryButtonClass}
        >
          {isSubmitting ? 'Saving…' : 'Finish Setup & Log In'}
        </button>
      </AuthCard>
    )
  }

  return (
    <AuthCard title={isFirstManager ? 'First Manager Setup' : 'Set Up Your Login'} onSubmit={startSetup}>
      <p className="mt-1 text-center text-sm text-black-900/60">
        {isFirstManager
          ? 'Create the first manager account using the manager password from the server settings.'
          : 'Enter the one-time setup code a manager gave you.'}
      </p>

      {accounts === null ? (
        <p role="alert" className="mt-6 rounded-lg bg-red-50 p-4 text-center text-sm font-bold text-red-800">
          Can’t reach the staff list. Check the Supabase connection and that the staff accounts migration has been run.
        </p>
      ) : isFirstManager ? (
        <>
          <label htmlFor="setup-name" className={`${labelClass} mt-6`}>
            Your name
          </label>
          <input
            id="setup-name"
            type="text"
            autoComplete="name"
            maxLength={40}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
          />
          <label htmlFor="setup-manager-password" className={labelClass}>
            Manager password
          </label>
          <input
            id="setup-manager-password"
            type="password"
            autoComplete="off"
            value={managerPassword}
            onChange={(event) => setManagerPassword(event.target.value)}
            className={inputClass}
          />
        </>
      ) : (
        <>
          <label htmlFor="setup-account" className={`${labelClass} mt-6`}>
            Your name
          </label>
          <Select id="setup-account" value={accountId} onChange={setAccountId} placeholder="Select your name">
            {people.map((account) => (
              <option key={account.id} value={account.id} className="text-black-900">
                {account.name}
                {account.role === 'manager' ? ' (Manager)' : ''}
              </option>
            ))}
          </Select>
          <label htmlFor="setup-code-input" className={labelClass}>
            Setup code
          </label>
          <input
            id="setup-code-input"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="XXXXX-XXXXX"
            value={setupCode}
            onChange={(event) => setSetupCode(event.target.value.toUpperCase())}
            className={`${inputClass} text-center font-mono text-lg tracking-[0.2em] placeholder:text-black-900/20`}
          />
        </>
      )}

      <FormError message={error} />

      <button
        type="submit"
        disabled={
          isSubmitting || accounts === null || (isFirstManager ? !name.trim() || !managerPassword : !accountId || !setupCode.trim())
        }
        className={primaryButtonClass}
      >
        {isSubmitting ? 'Checking…' : 'Continue'}
      </button>

      <div className="mt-6 space-y-2 text-center text-xs text-black-900/60">
        {firstManagerAvailable && (
          <p>
            <button
              type="button"
              onClick={() => {
                setIsFirstManager(!isFirstManager)
                setError(null)
              }}
              className="font-bold text-black-900 underline underline-offset-2"
            >
              {isFirstManager ? 'I have a setup code instead' : 'No managers yet? Create the first manager'}
            </button>
          </p>
        )}
        <p>
          Already set up?{' '}
          <Link href="/nambita-staff-access" className="font-bold text-black-900 underline underline-offset-2">
            Log in
          </Link>
        </p>
      </div>
    </AuthCard>
  )
}
