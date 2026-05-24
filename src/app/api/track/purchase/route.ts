import { NextRequest, NextResponse } from 'next/server'
import prisma, { ensureDb } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    await ensureDb()
    const body = await req.json()
    const {
      sessionId,
      affid = 'no_affiliate',
      planType,   // "Basic", "Professional", "Enterprise"
      revenue,    // Price in USD (500, 1200, 2000)
      source,     // "clickbank", "stripe", etc.
    } = body

    if (!sessionId || !planType || revenue === undefined) {
      return NextResponse.json({ error: 'sessionId, planType, and revenue are required' }, { status: 400 })
    }

    const purchase = await prisma.purchaseEvent.create({
      data: {
        sessionId,
        affid,
        planType,
        revenue: parseInt(String(revenue)) * 100, // Store in cents
        source: source || null,
      },
    })

    return NextResponse.json({ success: true, id: purchase.id })
  } catch (error: any) {
    console.error('[track/purchase] Error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET: retrieve purchase stats
export async function GET(req: NextRequest) {
  try {
    await ensureDb()
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '7')
    const affid = searchParams.get('affid')

    const since = new Date()
    since.setDate(since.getDate() - days)

    const where: any = { createdAt: { gte: since } }
    if (affid) where.affid = affid

    const [total, byPlanType, byAffid, bySource, totalRevenue] = await Promise.all([
      prisma.purchaseEvent.count({ where }),
      prisma.purchaseEvent.groupBy({ by: ['planType'], where, _count: true, _sum: { revenue: true }, orderBy: { _count: { planType: 'desc' } } }),
      prisma.purchaseEvent.groupBy({ by: ['affid'], where, _count: true, _sum: { revenue: true }, orderBy: { _count: { affid: 'desc' } } }),
      prisma.purchaseEvent.groupBy({ by: ['source'], where, _count: true, _sum: { revenue: true } }),
      prisma.purchaseEvent.aggregate({ where, _sum: { revenue: true } }),
    ])

    return NextResponse.json({
      total,
      byPlanType,
      byAffid,
      bySource,
      totalRevenueCents: totalRevenue._sum.revenue || 0,
      totalRevenueDollars: ((totalRevenue._sum.revenue || 0) / 100).toFixed(2),
      days,
    })
  } catch (error: any) {
    console.error('[track/purchase] GET Error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
