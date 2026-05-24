import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// On Vercel, use /tmp for the SQLite database (only writable directory)
function getDatabaseUrl(): string {
  if (process.env.VERCEL === '1') {
    return 'file:/tmp/massapro-tracking.db'
  }
  return process.env.DATABASE_URL || 'file:./db/custom.db'
}

const databaseUrl = getDatabaseUrl()

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Ensure the database exists on Vercel.
 * Call this at the top of each API route handler.
 */
export async function ensureDb() {
  if (process.env.VERCEL !== '1') return

  const dbPath = '/tmp/massapro-tracking.db'
  const fs = await import('fs')

  if (!fs.existsSync(dbPath)) {
    try {
      const { execSync } = await import('child_process')
      execSync('npx prisma db push --skip-generate', {
        stdio: 'pipe',
        env: { ...process.env, DATABASE_URL: `file:${dbPath}` },
      })
      console.log('[DB Init] Created database at', dbPath)
    } catch (e: any) {
      console.error('[DB Init] Failed to create database:', e.message)
    }
  }
}

export default prisma
