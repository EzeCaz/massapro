/**
 * Initialize the SQLite database on Vercel (/tmp directory).
 * This runs on the first API request and creates the database file + tables.
 */

import { execSync } from 'child_process'
import fs from 'fs'

let initialized = false

export function ensureDbInitialized() {
  if (initialized) return

  // Only needed on Vercel
  if (process.env.VERCEL !== '1') {
    initialized = true
    return
  }

  const dbPath = '/tmp/massapro-tracking.db'

  if (!fs.existsSync(dbPath)) {
    try {
      // Set DATABASE_URL for prisma db push
      process.env.DATABASE_URL = `file:${dbPath}`
      execSync('npx prisma db push --skip-generate', {
        stdio: 'pipe',
        env: { ...process.env, DATABASE_URL: `file:${dbPath}` },
      })
      console.log('[DB Init] Created database at', dbPath)
    } catch (e: any) {
      console.error('[DB Init] Failed:', e.message)
    }
  }

  initialized = true
}
