// Shared pieces for the maintenance commands (npm run ops:check / ops:monthly): printing, the database
// connection, and the health checks. Runs on your computer with Node, never in the website itself.

import { createClient } from '@supabase/supabase-js'

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

// ---------- Printing ----------

let warnings = 0

export function heading(text) {
  console.log(`\n=== ${text} ===`)
}
export function ok(text) {
  console.log(`  OK    ${text}`)
}
export function warn(text) {
  warnings += 1
  console.log(`  WARN  ${text}`)
}
export function info(text) {
  console.log(`        ${text}`)
}

/** Prints the final line and sets the exit code (1 = something needs attention). */
export function finish() {
  console.log('')
  if (warnings === 0) {
    console.log('All good.')
  } else {
    console.log(`${warnings} thing(s) need attention (see WARN above).`)
    process.exitCode = 1
  }
}

// ---------- Database ----------

/** Same connection the website uses (lib/supabase.ts), or null if the settings are missing. */
export function getDb() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export function hoursAgo(hours) {
  return new Date(Date.now() - hours * HOUR_MS).toISOString()
}
export function daysAgo(days) {
  return new Date(Date.now() - days * DAY_MS).toISOString()
}

// ---------- Checks ----------

// Every setting from README.md "Settings (.env.local)", with a rule for what a good value looks like.
const settings = [
  { name: 'YOCO_SECRET_KEY', valid: (v) => v.startsWith('sk_'), hint: 'should start with sk_ (Yoco dashboard → Developers)' },
  { name: 'YOCO_WEBHOOK_SECRET', valid: (v) => v.startsWith('whsec_'), hint: 'should start with whsec_' },
  { name: 'SUPABASE_URL', valid: (v) => v.startsWith('https://'), hint: 'should start with https://' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', valid: (v) => v.length > 40, hint: 'looks too short' },
  { name: 'DASHBOARD_SESSION_SECRET', valid: (v) => v.length >= 32, hint: 'needs 32+ characters' },
  { name: 'MANAGER_DASHBOARD_PASSWORD', valid: (v) => v.length >= 8, hint: 'needs 8+ characters' },
  { name: 'STAFF_DASHBOARD_PASSWORD', valid: (v) => v.length >= 8, hint: 'needs 8+ characters' },
  { name: 'RESEND_API_KEY', valid: (v) => v.startsWith('re_'), hint: 'should start with re_' },
  { name: 'RESEND_FROM_EMAIL', valid: (v) => v.includes('@'), hint: 'should be an email address' },
]

/** Checks every setting is filled in and looks right. Never prints the values themselves. */
export function checkSettings() {
  heading('Settings (.env.local)')
  for (const { name, valid, hint } of settings) {
    const value = process.env[name]?.trim()
    if (!value) warn(`${name} is missing`)
    else if (!valid(value)) warn(`${name} ${hint}`)
    else ok(name)
  }
  if (process.env.MANAGER_DASHBOARD_PASSWORD && process.env.MANAGER_DASHBOARD_PASSWORD === process.env.STAFF_DASHBOARD_PASSWORD) {
    warn('MANAGER_DASHBOARD_PASSWORD and STAFF_DASHBOARD_PASSWORD are the same, so staff could log in as managers')
  }
}

/** Checks the database can be reached and every table from supabase/ has been created. */
export async function checkDatabase(db) {
  heading('Database (Supabase)')
  if (!db) {
    warn('Cannot connect: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing')
    return false
  }

  let reachable = true
  for (const [table, sqlFile] of [
    ['orders', 'supabase/orders.sql'],
    ['staff_accounts', 'supabase/migrations/004_staff_accounts.sql'],
    ['rate_limits', 'supabase/migrations/005_rate_limits.sql'],
  ]) {
    const { error } = await db.from(table).select('*', { count: 'exact', head: true })
    if (!error) ok(`Table "${table}" exists`)
    else if (error.code === '42P01' || error.code === 'PGRST205') warn(`Table "${table}" is missing: run ${sqlFile}`)
    else {
      warn(`Could not read "${table}": ${error.message}`)
      reachable = false
    }
  }
  return reachable
}

/** Looks for orders that are stuck: never paid, or paid but never collected. */
export async function checkOrders(db) {
  heading('Orders')

  // Pending for over an hour: the customer gave up, or Yoco's webhook isn't reaching us.
  const { count: stuckPending, error: pendingError } = await db
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')
    .lt('created_at', hoursAgo(1))
    .gt('created_at', daysAgo(7))
  if (pendingError) warn(`Could not check pending orders: ${pendingError.message}`)
  else if (stuckPending > 0) {
    warn(`${stuckPending} order(s) from the last 7 days are still "pending" after an hour`)
    info('A few are normal (customers who left the payment page). Many means the Yoco webhook may be broken:')
    info('check the webhook URL in the Yoco dashboard and YOCO_WEBHOOK_SECRET.')
  } else ok('No orders stuck waiting for payment')

  // Paid but not collected after 12 hours: still sitting on the kitchen board.
  const { data: forgotten, error: forgottenError } = await db
    .from('orders')
    .select('order_number, pickup_location_name, created_at')
    .eq('status', 'paid')
    .neq('fulfillment_status', 'collected')
    .lt('created_at', hoursAgo(12))
    .order('created_at', { ascending: true })
    .limit(20)
  if (forgottenError) warn(`Could not check uncollected orders: ${forgottenError.message}`)
  else if (forgotten.length > 0) {
    warn(`${forgotten.length} paid order(s) older than 12 hours are still on the kitchen board:`)
    for (const order of forgotten) {
      info(`${order.order_number}  ${order.pickup_location_name}  ${order.created_at.slice(0, 10)}`)
    }
    info('Move them to Collected on /dashboard if the customer has been.')
  } else ok('No forgotten orders on the kitchen board')

  const { data: lastPaid } = await db
    .from('orders')
    .select('created_at')
    .eq('status', 'paid')
    .order('created_at', { ascending: false })
    .limit(1)
  info(`Last paid order: ${lastPaid?.[0]?.created_at.slice(0, 16).replace('T', ' ') ?? 'none yet'} (UTC)`)
}

/** Checks someone can still manage the team, and shows locked accounts. */
export async function checkStaff(db) {
  heading('Staff accounts')
  const { data: accounts, error } = await db.from('staff_accounts').select('name, role, is_active, locked_until')
  if (error) {
    warn(`Could not read staff accounts: ${error.message}`)
    return []
  }

  const active = accounts.filter((a) => a.is_active)
  const managers = active.filter((a) => a.role === 'manager')
  if (managers.length === 0) warn('No active manager: nobody can open /dashboard/team (see README "Staff logins")')
  else ok(`${managers.length} active manager(s), ${active.length - managers.length} active staff`)

  const locked = active.filter((a) => a.locked_until && new Date(a.locked_until) > new Date())
  for (const account of locked) info(`Locked for now (too many wrong passwords): ${account.name}`)

  return active
}
