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
 * Ensure the database and tables exist.
 * On Vercel, creates the SQLite DB + tables using better-sqlite3
 * since prisma db push can't run at runtime on serverless.
 * Locally, tables already exist from prisma db push.
 */
let dbInitialized = false

export async function ensureDb() {
  if (dbInitialized) return
  if (process.env.VERCEL !== '1') {
    dbInitialized = true
    return
  }

  const dbPath = '/tmp/massapro-tracking.db'

  try {
    const Database = (await import('better-sqlite3')).default
    const db = new Database(dbPath)

    // Create tables if they don't exist (matches Prisma schema)
    db.exec(`
      CREATE TABLE IF NOT EXISTS PageView (
        id TEXT PRIMARY KEY,
        sessionId TEXT NOT NULL,
        affid TEXT NOT NULL DEFAULT 'no_affiliate',
        page TEXT NOT NULL,
        referrer TEXT,
        userAgent TEXT,
        ip TEXT,
        utmSource TEXT,
        utmMedium TEXT,
        utmCampaign TEXT,
        utmContent TEXT,
        utmTerm TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS PageView_affid_idx ON PageView(affid);
      CREATE INDEX IF NOT EXISTS PageView_page_idx ON PageView(page);
      CREATE INDEX IF NOT EXISTS PageView_createdAt_idx ON PageView(createdAt);
      CREATE INDEX IF NOT EXISTS PageView_sessionId_idx ON PageView(sessionId);

      CREATE TABLE IF NOT EXISTS ClickEvent (
        id TEXT PRIMARY KEY,
        sessionId TEXT NOT NULL,
        affid TEXT NOT NULL DEFAULT 'no_affiliate',
        eventType TEXT NOT NULL,
        eventId TEXT NOT NULL,
        page TEXT NOT NULL,
        metadata TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS ClickEvent_affid_idx ON ClickEvent(affid);
      CREATE INDEX IF NOT EXISTS ClickEvent_eventType_idx ON ClickEvent(eventType);
      CREATE INDEX IF NOT EXISTS ClickEvent_eventId_idx ON ClickEvent(eventId);
      CREATE INDEX IF NOT EXISTS ClickEvent_createdAt_idx ON ClickEvent(createdAt);

      CREATE TABLE IF NOT EXISTS ScrollEvent (
        id TEXT PRIMARY KEY,
        sessionId TEXT NOT NULL,
        affid TEXT NOT NULL DEFAULT 'no_affiliate',
        page TEXT NOT NULL,
        scrollPct INTEGER NOT NULL,
        section TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS ScrollEvent_affid_idx ON ScrollEvent(affid);
      CREATE INDEX IF NOT EXISTS ScrollEvent_page_idx ON ScrollEvent(page);
      CREATE INDEX IF NOT EXISTS ScrollEvent_createdAt_idx ON ScrollEvent(createdAt);

      CREATE TABLE IF NOT EXISTS Lead (
        id TEXT PRIMARY KEY,
        sessionId TEXT NOT NULL,
        affid TEXT NOT NULL DEFAULT 'no_affiliate',
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        company TEXT,
        companyUrl TEXT,
        planType TEXT,
        message TEXT,
        utmSource TEXT,
        utmMedium TEXT,
        utmCampaign TEXT,
        utmContent TEXT,
        utmTerm TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS Lead_affid_idx ON Lead(affid);
      CREATE INDEX IF NOT EXISTS Lead_email_idx ON Lead(email);
      CREATE INDEX IF NOT EXISTS Lead_createdAt_idx ON Lead(createdAt);

      CREATE TABLE IF NOT EXISTS CartEvent (
        id TEXT PRIMARY KEY,
        sessionId TEXT NOT NULL,
        affid TEXT NOT NULL DEFAULT 'no_affiliate',
        planType TEXT NOT NULL,
        cartValue INTEGER NOT NULL,
        page TEXT NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS CartEvent_affid_idx ON CartEvent(affid);
      CREATE INDEX IF NOT EXISTS CartEvent_planType_idx ON CartEvent(planType);
      CREATE INDEX IF NOT EXISTS CartEvent_createdAt_idx ON CartEvent(createdAt);

      CREATE TABLE IF NOT EXISTS PurchaseEvent (
        id TEXT PRIMARY KEY,
        sessionId TEXT NOT NULL,
        affid TEXT NOT NULL DEFAULT 'no_affiliate',
        planType TEXT NOT NULL,
        revenue INTEGER NOT NULL,
        source TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS PurchaseEvent_affid_idx ON PurchaseEvent(affid);
      CREATE INDEX IF NOT EXISTS PurchaseEvent_planType_idx ON PurchaseEvent(planType);
      CREATE INDEX IF NOT EXISTS PurchaseEvent_createdAt_idx ON PurchaseEvent(createdAt);
    `)

    db.close()
    console.log('[DB Init] Database initialized at', dbPath)
    dbInitialized = true
  } catch (e: any) {
    console.error('[DB Init] Failed:', e.message)
  }
}

export default prisma
