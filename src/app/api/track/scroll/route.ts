import { NextRequest, NextResponse } from 'next/server'
import prisma, { ensureDb } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    await ensureDb()
    const body = await req.json()
    const {
      sessionId,
      affid = 'no_affiliate',
      page,
      scrollPct,
      section,
    } = body

    if (!sessionId || scrollPct === undefined) {
      return NextResponse.json({ error: 'sessionId and scrollPct are required' }, { status: 400 })
    }

    const scroll = await prisma.scrollEvent.create({
      data: {
        sessionId,
        affid,
        page: page || '/',
        scrollPct: Math.min(100, Math.max(0, parseInt(String(scrollPct)))),
        section: section || null,
      },
    })

    return NextResponse.json({ success: true, id: scroll.id })
  } catch (error: any) {
    console.error('[track/scroll] Error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET: retrieve scroll stats
export async function GET(req: NextRequest) {
  try {
    await ensureDb()
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '7')
    const affid = searchParams.get('affid')
    const page = searchParams.get('page')

    const since = new Date()
    since.setDate(since.getDate() - days)

    const where: any = { createdAt: { gte: since } }
    if (affid) where.affid = affid
    if (page) where.page = page

    // Get max scroll per session (most relevant metric)
    const rawScrolls = await prisma.scrollEvent.findMany({
      where,
      select: { sessionId: true, scrollPct: true, page: true, affid: true, createdAt: true },
      orderBy: { scrollPct: 'desc' },
    })

    // Group by session, keeping the max scroll per session
    const sessionMaxScroll = new Map<string, { scrollPct: number; page: string; affid: string }>()
    for (const s of rawScrolls) {
      const existing = sessionMaxScroll.get(s.sessionId)
      if (!existing || s.scrollPct > existing.scrollPct) {
        sessionMaxScroll.set(s.sessionId, { scrollPct: s.scrollPct, page: s.page, affid: s.affid })
      }
    }

    const totalSessions = sessionMaxScroll.size
    const avgScroll = totalSessions > 0
      ? Math.round([...sessionMaxScroll.values()].reduce((sum, s) => sum + s.scrollPct, 0) / totalSessions)
      : 0

    // Distribution buckets
    const buckets = { '0-25%': 0, '25-50%': 0, '50-75%': 0, '75-100%': 0 }
    for (const s of sessionMaxScroll.values()) {
      if (s.scrollPct <= 25) buckets['0-25%']++
      else if (s.scrollPct <= 50) buckets['25-50%']++
      else if (s.scrollPct <= 75) buckets['50-75%']++
      else buckets['75-100%']++
    }

    // By page
    const byPage: Record<string, { sessions: number; avgScroll: number }> = {}
    for (const s of sessionMaxScroll.values()) {
      if (!byPage[s.page]) byPage[s.page] = { sessions: 0, avgScroll: 0 }
      byPage[s.page].sessions++
      byPage[s.page].avgScroll += s.scrollPct
    }
    for (const p of Object.keys(byPage)) {
      byPage[p].avgScroll = Math.round(byPage[p].avgScroll / byPage[p].sessions)
    }

    return NextResponse.json({ totalSessions, avgScroll, buckets, byPage, days })
  } catch (error: any) {
    console.error('[track/scroll] GET Error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
