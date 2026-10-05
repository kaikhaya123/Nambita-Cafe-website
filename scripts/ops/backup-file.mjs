// Shared pieces for database backups: making a backup file, reading one back, and checking how old the
// newest one is. Used by ops:backup, ops:restore, ops:monthly and ops:check.
//
// A backup is one file in backups/ (on this computer, never committed to git), e.g.
// backups/nambita-backup-2026-10-05-1630.json.gz. It holds every row of the tables below.
// It contains customer names, phone numbers and emails: keep it private.

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { gunzipSync, gzipSync } from 'node:zlib'
import { info, ok, warn } from './shared.mjs'

export const BACKUP_DIR = 'backups'
// rate_limits isn't backed up: it only holds counters that are useless after 10 minutes.
export const BACKUP_TABLES = ['staff_accounts', 'orders']

const PAGE_SIZE = 1000 // Supabase's max rows per request
const SAST_OFFSET_MS = 2 * 60 * 60 * 1000 // South African time is UTC+2 all year
const DAY_MS = 24 * 60 * 60 * 1000
// ops:check warns when the newest backup is older than this.
const BACKUP_MAX_AGE_DAYS = 8

/** Every row of one table, a page at a time. Returns null (and warns) if it can't be read. */
async function readWholeTable(db, table) {
  const rows = []
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await db
      .from(table)
      .select('*')
      .order('id')
      .range(offset, offset + PAGE_SIZE - 1)
    if (error) {
      warn(`Could not read "${table}": ${error.message}`)
      return null
    }
    rows.push(...data)
    if (data.length < PAGE_SIZE) return rows
  }
}

/** Downloads every table in BACKUP_TABLES into a new file in backups/. Returns its path, or null if it failed. */
export async function createBackup(db) {
  const backup = { createdAt: new Date().toISOString(), tables: {} }
  for (const table of BACKUP_TABLES) {
    const rows = await readWholeTable(db, table)
    // Never save half a backup: it would look fine until the day it's needed.
    if (rows === null) return null
    backup.tables[table] = rows
    ok(`${table}: ${rows.length} row(s)`)
  }

  // e.g. "2026-10-05-1630", in South African time.
  const stamp = new Date(Date.now() + SAST_OFFSET_MS).toISOString().slice(0, 16).replace('T', '-').replace(':', '')
  mkdirSync(BACKUP_DIR, { recursive: true })
  const file = path.join(BACKUP_DIR, `nambita-backup-${stamp}.json.gz`)
  writeFileSync(file, gzipSync(JSON.stringify(backup)))
  ok(`Saved ${file}`)
  info('It contains customer details: keep it private (e.g. an encrypted drive). Never email it or add it to git.')
  return file
}

/** Reads a backup file made by createBackup(). Throws if it isn't one. */
export function readBackup(file) {
  const backup = JSON.parse(gunzipSync(readFileSync(file)).toString('utf8'))
  if (!backup?.tables || typeof backup.createdAt !== 'string') throw new Error(`${file} is not a Nambita backup file`)
  return backup
}

/** Warns if there's no backup on this computer, or the newest one is more than a week old. */
export function checkBackupAge() {
  const files = existsSync(BACKUP_DIR) ? readdirSync(BACKUP_DIR).filter((name) => name.endsWith('.json.gz')) : []
  if (files.length === 0) {
    warn('No database backup on this computer yet: run "npm run ops:backup"')
    return
  }
  const newest = Math.max(...files.map((name) => statSync(path.join(BACKUP_DIR, name)).mtimeMs))
  const days = Math.floor((Date.now() - newest) / DAY_MS)
  if (days > BACKUP_MAX_AGE_DAYS) warn(`Newest database backup is ${days} days old: run "npm run ops:backup"`)
  else ok(`Newest database backup is ${days === 0 ? 'from today' : `${days} day(s) old`} (${files.length} in backups/)`)
}
