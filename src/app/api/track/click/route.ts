import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      sessionId,
      affid = 'no_affiliate',
      eventType,  // "button_click", "link_click", etc.
      eventId,    // "btn_buy_basic", "btn_book_demo", etc.
      page,
      metadata,
    } = body

    if (!sessionId || !eventType || !eventId) {
      return NextResponse.json({ error: 'sessionId, eventType, and eventId are required' }, { status: 400 })
    }

    const click = await prisma.clickEvent.create({
      data: {
        sessionId,
        affid,
        eventType,
        eventId,
        page: page || '/',
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })

    return NextResponse.json({ success: true, id: click.id })
  } catch (error: any) {
    console.error('[track/click] Error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET: retrieve click stats
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '7')
    const affid = searchParams.get('affid')
    const eventType = searchParams.get('eventType')

    const since = new Date()
    since.setDate(since.getDate() - days)

    const where: any = { createdAt: { gte: since } }
    if (affid) where.affid = affid
    if (eventType) where.eventType = eventType

    const [total, byEventType, byEventId, byAffid] = await Promise.all([
      prisma.clickEvent.count({ where }),
      prisma.clickEvent.groupBy({ by: ['eventType'], where, _count: true, orderBy: { _count: { eventType: 'desc' } } }),
      prisma.clickEvent.groupBy({ by: ['eventId'], where, _count: true, orderBy: { _count: { eventId: 'desc' } } }),
      prisma.clickEvent.groupBy({ by: ['affid'], where, _count: true, orderBy: { _count: { affid: 'desc' } } }),
    ])

    return NextResponse.json({ total, byEventType, byEventId, byAffid, days })
  } catch (error: any) {
    console.error('[track/click] GET Error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
