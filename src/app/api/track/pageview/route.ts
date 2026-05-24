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
      referrer,
      userAgent,
      ip,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
    } = body

    if (!sessionId || !page) {
      return NextResponse.json({ error: 'sessionId and page are required' }, { status: 400 })
    }

    const pageView = await prisma.pageView.create({
      data: {
        sessionId,
        affid,
        page,
        referrer: referrer || null,
        userAgent: userAgent || null,
        ip: ip || null,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        utmContent: utmContent || null,
        utmTerm: utmTerm || null,
      },
    })

    return NextResponse.json({ success: true, id: pageView.id })
  } catch (error: any) {
    console.error('[track/pageview] Error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET: retrieve pageview stats
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

    const [total, byPage, byAffid] = await Promise.all([
      prisma.pageView.count({ where }),
      prisma.pageView.groupBy({ by: ['page'], where, _count: true, orderBy: { _count: { page: 'desc' } } }),
      prisma.pageView.groupBy({ by: ['affid'], where, _count: true, orderBy: { _count: { affid: 'desc' } } }),
    ])

    return NextResponse.json({ total, byPage, byAffid, days })
  } catch (error: any) {
    console.error('[track/pageview] GET Error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
