'use client'

// Manager login step 2 form: the 6-digit authenticator code. (Staff log in with just a password.)

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthCard, CodeInput, FormError, labelClass, primaryButtonClass } from './AuthCard'

export default function VerifyCodeForm({ name }: Readonly<{ name: string }>) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [mustRestart, setMustRestart] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/staff/session/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = (await response.json().catch(() => null)) as { error?: string; next?: string; restart?: boolean } | null
      if (!response.ok || !data?.next) {
        setMustRestart(Boolean(data?.restart))
        throw new Error(data?.error ?? 'Could not sign in.')
      }
      router.replace(data.next)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.')
      setCode('')
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard title="Authenticator Code" onSubmit={handleSubmit}>
      <p className="mt-1 text-center text-sm text-black-900/60">
        Password accepted for <span className="font-bold text-black-900">{name}</span>.
      </p>

      <label htmlFor="login-code" className={`${labelClass} mt-6`}>
        Authenticator code
      </label>
      <CodeInput id="login-code" value={code} onChange={setCode} autoFocus />
      <p className="mt-1.5 text-xs text-black-900/50">The 6-digit code for Nambita Cafe in your authenticator app.</p>

      <FormError message={error} />

      {mustRestart ? (
        <Link href="/nambita-staff-access" className={`${primaryButtonClass} block text-center`}>
          Back to Login
        </Link>
      ) : (
        <button type="submit" disabled={isSubmitting || code.length !== 6} className={primaryButtonClass}>
          {isSubmitting ? 'Checking…' : 'Log In'}
        </button>
      )}

      <p className="mt-6 text-center text-xs text-black-900/60">
        Not you?{' '}
        <Link href="/nambita-staff-access" className="font-bold text-black-900 underline underline-offset-2">
          Start again
        </Link>
      </p>
    </AuthCard>
  )
}
