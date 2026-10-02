import { getSupabaseAdmin } from '@/lib/supabase'

// Server-only. Dashboard accounts (see supabase/migrations/004_staff_accounts.sql).
// Everyone picks their own name, then types their role's shared password:
// staff use STAFF_DASHBOARD_PASSWORD and managers use MANAGER_DASHBOARD_PASSWORD (server settings).
// The password_hash / totp_secret / setup_code columns are from the old personal logins and aren't used any more.

export type StaffRole = 'staff' | 'manager'

export interface StaffAccount {
  id: string
  name: string
  role: StaffRole
  is_active: boolean
  password_hash: string | null
  totp_secret: string | null
  last_totp_step: number | null
  setup_code_hash: string | null
  setup_code_expires_at: string | null
  failed_attempts: number
  locked_until: string | null
  session_version: number
}

/** What the login and team pages may show — never hashes or secrets. */
export interface StaffAccountSummary {
  id: string
  name: string
  role: StaffRole
  isActive: boolean
  isSetUp: boolean
}

export const MAX_FAILED_ATTEMPTS = 5
export const LOCKOUT_MS = 15 * 60 * 1000

export function isStaffRole(value: unknown): value is StaffRole {
  return value === 'staff' || value === 'manager'
}

export function cleanStaffName(value: unknown, maxLength = 40) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, maxLength) : ''
}

const MIN_ROLE_PASSWORD_LENGTH = 8

// Which server setting holds each role's shared password.
const rolePasswordSetting: Record<StaffRole, string> = {
  staff: 'STAFF_DASHBOARD_PASSWORD',
  manager: 'MANAGER_DASHBOARD_PASSWORD',
}

/** The name of the setting that holds this role's password, for messages like "set MANAGER_DASHBOARD_PASSWORD". */
export function rolePasswordSettingName(role: StaffRole) {
  return rolePasswordSetting[role]
}

/**
 * The shared password for a role, from the server settings (.env.local / Vercel), or null if it's
 * missing or shorter than 8 characters (too easy to guess, so that role can't log in).
 */
export function rolePassword(role: StaffRole) {
  const value = process.env[rolePasswordSetting[role]]?.trim() ?? ''
  return value.length >= MIN_ROLE_PASSWORD_LENGTH ? value : null
}

/** True if this person can log in, i.e. their role's password is set on the server. */
export function isSetUp(account: StaffAccount) {
  return rolePassword(account.role) !== null
}

export function summarize(account: StaffAccount): StaffAccountSummary {
  return {
    id: account.id,
    name: account.name,
    role: account.role,
    isActive: account.is_active,
    isSetUp: isSetUp(account),
  }
}

export async function listAccounts(): Promise<StaffAccount[]> {
  const { data, error } = await getSupabaseAdmin().from('staff_accounts').select('*').order('role').order('name')
  if (error) throw error
  return (data ?? []) as StaffAccount[]
}

export async function getAccount(id: string): Promise<StaffAccount | null> {
  // Reject non-UUIDs up front so Postgres doesn't throw on bad input.
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const { data, error } = await getSupabaseAdmin().from('staff_accounts').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return (data as StaffAccount | null) ?? null
}

/** Case-insensitive exact match. Compared in code, not with `ilike`, whose %, _ and * wildcards would match other names. */
export async function getAccountByName(name: string): Promise<StaffAccount | null> {
  const wanted = name.toLowerCase()
  return (await listAccounts()).find((account) => account.name.toLowerCase() === wanted) ?? null
}

export async function updateAccount(id: string, fields: Partial<Omit<StaffAccount, 'id'>>) {
  const { error } = await getSupabaseAdmin().from('staff_accounts').update(fields).eq('id', id)
  if (error) throw error
}

export async function createAccount(fields: Partial<Omit<StaffAccount, 'id'>> & { name: string; role: StaffRole }) {
  const { data, error } = await getSupabaseAdmin().from('staff_accounts').insert(fields).select('*').single()
  if (error) throw error
  return data as StaffAccount
}

export function isLocked(account: StaffAccount) {
  return Boolean(account.locked_until && new Date(account.locked_until).getTime() > Date.now())
}

/** Counts a wrong password and locks the account after too many. */
export async function recordFailedAttempt(account: StaffAccount) {
  const attempts = account.failed_attempts + 1
  await updateAccount(account.id, {
    failed_attempts: attempts >= MAX_FAILED_ATTEMPTS ? 0 : attempts,
    locked_until: attempts >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MS).toISOString() : account.locked_until,
  })
}
