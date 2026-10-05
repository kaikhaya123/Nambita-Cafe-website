// npm run ops:check: a quick, read-only health check of settings, database, orders, staff accounts and backups.
// Safe to run any time; it never changes anything.

import { checkBackupAge } from './backup-file.mjs'
import { checkDatabase, checkOrders, checkSettings, checkStaff, finish, getDb, heading } from './shared.mjs'

console.log('Nambita Cafe: health check')

checkSettings()
const db = getDb()
if (await checkDatabase(db)) {
  await checkOrders(db)
  await checkStaff(db)
}
heading('Backups')
checkBackupAge()
finish()
