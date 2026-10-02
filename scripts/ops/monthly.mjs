// npm run ops:monthly: the once-a-month maintenance routine. Runs the health check, sums up last
// month's sales, tidies old database rows, lists who can log in, and checks the npm packages.
// Add `-- --dry-run` to see what it would tidy without changing anything.

import { execSync } from 'node:child_process'
import { checkDatabase, checkOrders, checkSettings, checkStaff, daysAgo, finish, getDb, heading, info, ok, warn } from './shared.mjs'

const DRY_RUN = process.argv.includes('--dry-run')
const SAST_OFFSET_MS = 2 * 60 * 60 * 1000 // South African time is UTC+2 all year
const PAGE_SIZE = 1000 // Supabase's max rows per request

console.log(`Nambita Cafe: monthly maintenance${DRY_RUN ? ' (dry run: nothing will be changed)' : ''}`)

// 1. Same checks as `npm run ops:check`.
checkSettings()
const db = getDb()
const databaseOk = await checkDatabase(db)
let activeStaff = []
if (databaseOk) {
  await checkOrders(db)
  activeStaff = await checkStaff(db)
  await lastMonthReport()
  await tidyUp()
  staffReview()
}
packageCheck()
finish()

// 2. Sales for the previous calendar month (South African time), from paid orders.
async function lastMonthReport() {
  const sastNow = new Date(Date.now() + SAST_OFFSET_MS)
  const year = sastNow.getUTCFullYear()
  const month = sastNow.getUTCMonth() // 0-based, so this is "this month"
  const start = new Date(Date.UTC(year, month - 1, 1) - SAST_OFFSET_MS)
  const end = new Date(Date.UTC(year, month, 1) - SAST_OFFSET_MS)
  const label = new Date(Date.UTC(year, month - 1, 1)).toLocaleString('en-ZA', { month: 'long', year: 'numeric', timeZone: 'UTC' })

  heading(`Sales report: ${label}`)

  const orders = []
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await db
      .from('orders')
      .select('total, pickup_location_name, items')
      .eq('status', 'paid')
      .gte('created_at', start.toISOString())
      .lt('created_at', end.toISOString())
      .range(offset, offset + PAGE_SIZE - 1)
    if (error) {
      warn(`Could not load last month's orders: ${error.message}`)
      return
    }
    orders.push(...data)
    if (data.length < PAGE_SIZE) break
  }

  if (orders.length === 0) {
    info('No paid orders last month.')
    return
  }

  const revenue = orders.reduce((sum, order) => sum + Number(order.total), 0)
  info(`Paid orders: ${orders.length}`)
  info(`Revenue:     ${rand(revenue)}  (average ${rand(revenue / orders.length)} per order)`)

  const byBranch = new Map()
  const itemCounts = new Map()
  for (const order of orders) {
    const branch = byBranch.get(order.pickup_location_name) ?? { orders: 0, revenue: 0 }
    branch.orders += 1
    branch.revenue += Number(order.total)
    byBranch.set(order.pickup_location_name, branch)

    for (const line of order.items ?? []) {
      const name = line.item?.name ?? 'Unknown item'
      itemCounts.set(name, (itemCounts.get(name) ?? 0) + (line.quantity ?? 0))
    }
  }

  info('')
  info('By branch:')
  for (const [name, branch] of byBranch) info(`  ${name}: ${branch.orders} order(s),${rand(branch.revenue)}`)

  info('')
  info('Top 5 items:')
  const top = [...itemCounts].sort((a, b) => b[1] - a[1]).slice(0, 5)
  top.forEach(([name, quantity], i) => info(`  ${i + 1}. ${name} (${quantity} sold)`))
}

// 3. Remove rows nobody needs any more.
async function tidyUp() {
  heading('Tidy up')

  // Orders never paid after 2 days: the customer left the Yoco page. Marked "cancelled" (not deleted)
  // so the order number history stays complete. If Yoco ever does confirm one later, the webhook
  // still marks it paid (app/api/webhooks/yoco/route.ts only refuses to change orders that are already paid).
  const { data: toCancel, error: findError } = await db
    .from('orders')
    .select('order_number')
    .eq('status', 'pending')
    .lt('created_at', daysAgo(2))
  if (findError) warn(`Could not look for abandoned orders: ${findError.message}`)
  else if (toCancel.length === 0) ok('No abandoned unpaid orders')
  else if (DRY_RUN) info(`Would mark ${toCancel.length} unpaid order(s) older than 2 days as cancelled`)
  else {
    const { error } = await db
      .from('orders')
      .update({ status: 'cancelled' })
      .in('order_number', toCancel.map((o) => o.order_number))
      .eq('status', 'pending')
    if (error) warn(`Could not cancel abandoned orders: ${error.message}`)
    else ok(`Marked ${toCancel.length} unpaid order(s) older than 2 days as cancelled`)
  }

  // Rate-limit counters only matter for 10 minutes; anything older than a day is leftover.
  const { count, error: countError } = await db
    .from('rate_limits')
    .select('key', { count: 'exact', head: true })
    .lt('window_start', daysAgo(1))
  if (countError) warn(`Could not check rate-limit counters: ${countError.message}`)
  else if (count === 0) ok('No old rate-limit counters')
  else if (DRY_RUN) info(`Would delete ${count} old rate-limit counter(s)`)
  else {
    const { error } = await db.from('rate_limits').delete().lt('window_start', daysAgo(1))
    if (error) warn(`Could not delete old rate-limit counters: ${error.message}`)
    else ok(`Deleted ${count} old rate-limit counter(s)`)
  }
}

// 4. A reminder to check the login list against who actually works at the cafe.
function staffReview() {
  heading('Who can log in to the dashboard')
  for (const account of [...activeStaff].sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name))) {
    info(`${account.role.padEnd(8)} ${account.name}`)
  }
  info('')
  info('Anyone here who has left? Deactivate them on /dashboard/team.')
}

// 5. Security fixes and updates for the npm packages.
function packageCheck() {
  heading('Packages')

  const audit = runJson('npm audit --omit=dev --json')
  const counts = audit?.metadata?.vulnerabilities
  if (!counts) warn('Could not run npm audit (are you online?)')
  else {
    const serious = (counts.high ?? 0) + (counts.critical ?? 0)
    const total = counts.total ?? 0
    if (serious > 0) warn(`${serious} high/critical security issue(s) in packages: run "npm audit" for details, then "npm audit fix"`)
    else if (total > 0) info(`${total} low/moderate security issue(s) in packages (run "npm audit" to see them)`)
    else ok('No known security issues in packages')
  }

  const outdated = runJson('npm outdated --json')
  if (!outdated) warn('Could not run npm outdated')
  else {
    const names = Object.keys(outdated)
    if (names.length === 0) ok('All packages are up to date')
    else {
      info(`${names.length} package(s) have newer versions:`)
      for (const name of names) {
        const { current = '?', latest = '?' } = outdated[name]
        // A different first number (e.g. 18 → 19) means a big update that can break things.
        const big = current.split('.')[0] !== latest.split('.')[0]
        info(`  ${name}: ${current} → ${latest}${big ? '   (big update: read its upgrade guide first)' : ''}`)
      }
      info('Small updates: "npm update". Then run npm run lint and npm run build, and test the site.')
    }
  }
}

// npm audit / outdated exit with an error code when they find something, but still print JSON.
function runJson(command) {
  try {
    return JSON.parse(execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }) || '{}')
  } catch (error) {
    try {
      return JSON.parse(error.stdout || '{}')
    } catch {
      return null
    }
  }
}

function rand(amount) {
  return `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
