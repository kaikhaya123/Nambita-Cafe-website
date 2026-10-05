// npm run ops:restore -- backups/<file>.json.gz : puts a backup made by ops:backup back into the database.
// Use it after data was lost or damaged, or to fill a brand-new Supabase project (run the SQL in supabase/ first).
//
// Safe by default: it only says what it WOULD do. Add --confirm to really write:
//   npm run ops:restore -- backups/nambita-backup-2026-10-05-1630.json.gz --confirm
// Rows are matched by id: a row in the backup replaces the same row in the database, and rows that aren't
// in the backup are left alone (nothing is deleted).

import { BACKUP_TABLES, readBackup } from './backup-file.mjs'
import { checkDatabase, finish, getDb, heading, info, ok, warn } from './shared.mjs'

const CONFIRMED = process.argv.includes('--confirm')
const file = process.argv.slice(2).find((arg) => arg.endsWith('.json.gz'))
const CHUNK_SIZE = 500 // rows written per request

console.log(`Nambita Cafe: restore from backup${CONFIRMED ? '' : ' (dry run: nothing will be changed)'}`)
await restore()
finish()

async function restore() {
  heading('Backup file')
  if (!file) {
    warn('Say which backup to restore, e.g. npm run ops:restore -- backups/nambita-backup-2026-10-05-1630.json.gz')
    return
  }
  let backup
  try {
    backup = readBackup(file)
  } catch (error) {
    warn(`Could not read ${file}: ${error.message}`)
    return
  }
  ok(`${file}, made ${backup.createdAt.slice(0, 16).replace('T', ' ')} (UTC)`)

  const db = getDb()
  if (!(await checkDatabase(db))) return

  heading(CONFIRMED ? 'Restoring' : 'Would restore')
  for (const table of BACKUP_TABLES) {
    const rows = backup.tables[table] ?? []
    if (!CONFIRMED) {
      info(`${table}: ${rows.length} row(s)`)
      continue
    }
    for (let start = 0; start < rows.length; start += CHUNK_SIZE) {
      const { error } = await db.from(table).upsert(rows.slice(start, start + CHUNK_SIZE), { onConflict: 'id' })
      if (error) {
        warn(`Stopped while restoring "${table}": ${error.message}`)
        return
      }
    }
    ok(`${table}: ${rows.length} row(s) restored`)
  }

  // New orders get their number from a counter in the database (supabase/orders.sql). After a restore into a
  // new or emptied database, that counter must be moved past the restored orders, or new orders would reuse numbers.
  const highest = Math.max(0, ...(backup.tables.orders ?? []).map((order) => Number(/(\d+)$/.exec(order.order_number)?.[1] ?? 0)))
  heading('One more step (Supabase SQL Editor)')
  info(`${CONFIRMED ? 'Now run' : 'After restoring, run'} this so new order numbers carry on after the restored ones:`)
  info(`  select setval('orders_order_seq', greatest(${highest}, (select last_value from orders_order_seq)));`)
  if (!CONFIRMED) info('Nothing was changed. Add --confirm to restore for real.')
}
