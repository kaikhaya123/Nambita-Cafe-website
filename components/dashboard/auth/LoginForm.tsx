'use client'

// Dashboard login form: choose Staff or Manager, type your name, type your role's shared password.
// Names are typed rather than picked from a list, so the public login page never shows who works here.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { StaffRole } from '@/lib/staff-accounts'
import { AuthCard, FormError, inputClass, labelClass, primaryButtonClass } from './AuthCard'

const roleOptions: { value: StaffRole; label: string }[] = [
  { value: 'staff', label: 'Staff' },
  { value: 'manager', label: 'Manager' },
]

export default function LoginForm() {
  const router = useRouter()
  const [role, setRole] = useState<StaffRole>('staff')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedRole = roleOptions.find((option) => option.value === role) ?? roleOptions[0]

  function chooseRole(next: StaffRole) {
    setRole(next)
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
        body: JSON.stringify({ role, name, password }),
      })
      const data = (await response.json().catch(() => null)) as { error?: string; next?: string } | null
      if (!response.ok || !data?.next) throw new Error(data?.error ?? 'Could not sign in.')
      // Logged in: staff go to the orders board, managers to Sales.
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
              option.value === role ? 'bg-black-900 text-white' : 'text-black-900/80 hover:text-black-900'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <label htmlFor="login-name" className={`${labelClass} mt-6`}>
        Your name
      </label>
      <input
        id="login-name"
        type="text"
        autoComplete="username"
        maxLength={40}
        placeholder="As it appears on the Team page"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className={inputClass}
      />

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

      <button type="submit" disabled={isSubmitting || !name.trim() || !password} className={primaryButtonClass}>
        {isSubmitting ? 'Checking…' : 'Log In'}
      </button>

      <p className="mt-6 text-center text-xs text-black-900/80">
        Use the {selectedRole.label.toLowerCase()} password from HQ. Don’t know it? Ask HQ.
      </p>
    </AuthCard>
  )
}
