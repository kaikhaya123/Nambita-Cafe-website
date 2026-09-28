import { getSupabaseAdmin } from '@/lib/supabase'

// Server-only. Personal dashboard accounts (see supabase/migrations/004_staff_accounts.sql).

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
  setupCodeExpiresAt: string | null
}

export const MAX_FAILED_ATTEMPTS = 5
export const LOCKOUT_MS = 15 * 60 * 1000
export const SETUP_CODE_TTL_MS = 48 * 60 * 60 * 1000

export function isStaffRole(value: unknown): value is StaffRole {
  return value === 'staff' || value === 'manager'
}

export function cleanStaffName(value: unknown, maxLength = 40) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, maxLength) : ''
}

export function summarize(account: StaffAccount): StaffAccountSummary {
  const codeValid = Boolean(
    account.setup_code_hash && account.setup_code_expires_at && new Date(account.setup_code_expires_at).getTime() > Date.now()
  )
  return {
    id: account.id,
    name: account.name,
    role: account.role,
    isActive: account.is_active,
    isSetUp: Boolean(account.password_hash && account.totp_secret),
    setupCodeExpiresAt: codeValid ? account.setup_code_expires_at : null,
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

/**
 * Saves new credentials only if the setup code is still the one issued (single atomic
 * update), so the same code can't be used twice even by two browsers at once.
 */
export async function consumeSetupCode(id: string, codeHash: string, fields: Partial<Omit<StaffAccount, 'id'>>) {
  const { data, error } = await getSupabaseAdmin()
    .from('staff_accounts')
    .update(fields)
    .eq('id', id)
    .eq('setup_code_hash', codeHash)
    .gt('setup_code_expires_at', new Date().toISOString())
    .eq('is_active', true)
    .select('id')
  if (error) throw error
  return (data ?? []).length === 1
}

export async function createAccount(fields: Partial<Omit<StaffAccount, 'id'>> & { name: string; role: StaffRole }) {
  const { data, error } = await getSupabaseAdmin().from('staff_accounts').insert(fields).select('*').single()
  if (error) throw error
  return data as StaffAccount
}

export async function hasActiveManager() {
  const { count, error } = await getSupabaseAdmin()
    .from('staff_accounts')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'manager')
    .eq('is_active', true)
    .not('password_hash', 'is', null)
  if (error) throw error
  return (count ?? 0) > 0
}

export function isLocked(account: StaffAccount) {
  return Boolean(account.locked_until && new Date(account.locked_until).getTime() > Date.now())
}

/** Counts a failed password/code attempt and locks the account after too many. */
export async function recordFailedAttempt(account: StaffAccount) {
  const attempts = account.failed_attempts + 1
  await updateAccount(account.id, {
    failed_attempts: attempts >= MAX_FAILED_ATTEMPTS ? 0 : attempts,
    locked_until: attempts >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MS).toISOString() : account.locked_until,
  })
}
