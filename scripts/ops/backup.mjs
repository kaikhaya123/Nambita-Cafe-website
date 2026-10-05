// npm run ops:backup: downloads a copy of the live database (orders and staff accounts) into backups/
// on this computer. Run it every week, and before any big change to the database.
// Read-only: it never changes the database. To put a backup back, see scripts/ops/restore.mjs.

import { createBackup } from './backup-file.mjs'
import { finish, getDb, heading, warn } from './shared.mjs'

console.log('Nambita Cafe: database backup')
heading('Backup')

const db = getDb()
if (!db) warn('Cannot connect: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing')
else if (!(await createBackup(db))) warn('Backup NOT saved (see above). Fix the problem and run it again.')
finish()
