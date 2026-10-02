// npm run ops:check: a quick, read-only health check of settings, database, orders and staff accounts.
// Safe to run any time; it never changes anything.

import { checkDatabase, checkOrders, checkSettings, checkStaff, finish, getDb } from './shared.mjs'

console.log('Nambita Cafe: health check')

checkSettings()
const db = getDb()
if (await checkDatabase(db)) {
  await checkOrders(db)
  await checkStaff(db)
}
finish()
