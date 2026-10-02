'use client'

// Team page list: shows each person's status and the Deactivate / Reactivate button, plus "Add a team member".
// Nobody has their own password: staff share STAFF_DASHBOARD_PASSWORD and managers share MANAGER_DASHBOARD_PASSWORD.

import { useState } from 'react'
import RoleAvatar from '@/components/dashboard/RoleAvatar'
import type { StaffAccountSummary, StaffRole } from '@/lib/staff-accounts'

interface Props {
  initialAccounts: StaffAccountSummary[]
  currentAccountId: string
}

function statusOf(account: StaffAccountSummary) {
  if (!account.isActive) return { label: 'Deactivated', tone: 'bg-black-900/10 text-black-900/60' }
  if (account.isSetUp) return { label: 'Active', tone: 'bg-brand-green text-white' }
  // Only happens when that role's password is missing on the server.
  return { label: 'No password set', tone: 'bg-amber-200 text-amber-900' }
}

// Same avatar as the menu's "Logged in as" (man icon for managers), faded when deactivated.
// Active accounts get a glowing green "online" badge on the corner.
function Avatar({ role, isActive, online }: Readonly<{ role: StaffRole; isActive: boolean; online: boolean }>) {
  return (
    <span className="relative shrink-0" title={online ? 'Active' : undefined}>
      <RoleAvatar role={role} className={`h-11 w-11 ${isActive ? '' : 'opacity-30'}`} />
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 shadow-[0_0_8px_3px_rgba(34,197,94,0.6)]" />
          <span className="sr-only">Active</span>
        </span>
      )}
    </span>
  )
}

async function request<T>(url: string, method: string, body?: object): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = (await response.json().catch(() => null)) as (T & { error?: string }) | null
  if (!response.ok || !data) throw new Error(data?.error ?? 'Something went wrong.')
  return data
}

export default function TeamManager({ initialAccounts, currentAccountId }: Readonly<Props>) {
  const [accounts, setAccounts] = useState(initialAccounts)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<StaffRole>('staff')

  function replace(account: StaffAccountSummary) {
    setAccounts((current) => current.map((a) => (a.id === account.id ? account : a)))
  }

  async function setActive(account: StaffAccountSummary, isActive: boolean) {
    if (!isActive && !window.confirm(`Deactivate ${account.name}? They'll be logged out and can't log in.`)) return
    setBusyId(account.id)
    setError(null)
    try {
      const result = await request<{ account: StaffAccountSummary }>(`/api/staff/team/${account.id}`, 'PATCH', { isActive })
      replace(result.account)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update team member.')
    } finally {
      setBusyId(null)
    }
  }

  async function addMember(event: React.FormEvent) {
    event.preventDefault()
    setBusyId('new')
    setError(null)
    try {
      const result = await request<{ account: StaffAccountSummary }>('/api/staff/team', 'POST', { name: newName, role: newRole })
      setAccounts((current) => [...current, result.account])
      setNewName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add team member.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-center text-sm font-bold text-red-800">
          {error}
        </p>
      )}

      <ul className="divide-y divide-black-900/10 overflow-hidden rounded-2xl border border-black-900/10 bg-white">
        {accounts.map((account) => {
          const status = statusOf(account)
          const isMe = account.id === currentAccountId
          const isBusy = busyId === account.id
          return (
            // Fixed columns (name | status | deactivate) so every row lines up.
            <li
              key={account.id}
              className="grid grid-cols-2 items-center gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_10rem_8.5rem] sm:gap-4"
            >
              <div className="col-span-2 flex min-w-0 items-center gap-3 sm:col-span-1">
                <Avatar role={account.role} isActive={account.isActive} online={status.label === 'Active'} />
                <div className="min-w-0">
                  <p className="truncate font-bold">
                    {account.name}
                    {isMe && <span className="ml-2 text-xs font-normal text-black-900/50">(you)</span>}
                  </p>
                  <p className="text-xs uppercase tracking-[0.08em] text-black-900/50">{account.role}</p>
                </div>
              </div>
              <div className={`sm:flex sm:justify-center ${status.label === 'Active' ? 'hidden' : 'flex'}`}>
                {status.label !== 'Active' && (
                  <span className={`w-full max-w-[10rem] rounded-full px-3 py-1 text-center text-xs font-bold ${status.tone}`}>
                    {status.label}
                  </span>
                )}
              </div>

              {/* Empty on your own row, so the columns stay aligned. */}
              <div>
                {!isMe && (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => setActive(account, !account.isActive)}
                    className="w-full rounded-full border border-black-900/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-black-900/70 hover:border-black-900 disabled:opacity-40"
                  >
                    {account.isActive ? 'Deactivate' : 'Reactivate'}
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <form onSubmit={addMember} className="rounded-2xl border border-black-900/10 bg-white p-5 sm:p-6">
        <h2 className="text-sm font-bold">Add a team member</h2>
        <p className="mt-1 text-xs text-black-900/60">
          They can log in straight away with the staff or manager password from HQ.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="new-member-name">
            Name
          </label>
          <input
            id="new-member-name"
            type="text"
            maxLength={40}
            placeholder="Full name"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            className="flex-1 rounded-lg border border-black-900/30 px-4 py-3 text-base outline-none focus:border-black-900 focus:ring-2 focus:ring-brand-yellow"
          />
          <label className="sr-only" htmlFor="new-member-role">
            Role
          </label>
          <select
            id="new-member-role"
            value={newRole}
            onChange={(event) => setNewRole(event.target.value as StaffRole)}
            className="rounded-lg border border-black-900/30 bg-white px-4 py-3 text-base outline-none focus:border-black-900 focus:ring-2 focus:ring-brand-yellow"
          >
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
          </select>
          <button
            type="submit"
            disabled={busyId === 'new' || !newName.trim()}
            className="rounded-full bg-black-900 px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  )
}
