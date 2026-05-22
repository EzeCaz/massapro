import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/track/dashboard?days=7
// Returns an aggregated dashboard summary of all tracking data
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '7')
    const affid = searchParams.get('affid')

    const since = new Date()
    since.setDate(since.getDate() - days)

    const whereBase: any = { createdAt: { gte: since } }
    if (affid) whereBase.affid = affid

    const [
      pageViews,
      pageViewsByPage,
      clicks,
      clicksByType,
      clicksById,
      scrollSessions,
      leads,
      leadsByAffid,
      carts,
      cartRevenue,
      purchases,
      purchaseRevenue,
    ] = await Promise.all([
      prisma.pageView.count({ where: whereBase }),
      prisma.pageView.groupBy({ by: ['page'], where: whereBase, _count: true, orderBy: { _count: { page: 'desc' } } }),
      prisma.clickEvent.count({ where: whereBase }),
      prisma.clickEvent.groupBy({ by: ['eventType'], where: whereBase, _count: true }),
      prisma.clickEvent.groupBy({ by: ['eventId'], where: whereBase, _count: true, orderBy: { _count: { eventId: 'desc' } } }),
      prisma.scrollEvent.count({ where: whereBase }),
      prisma.lead.count({ where: whereBase }),
      prisma.lead.groupBy({ by: ['affid'], where: whereBase, _count: true, orderBy: { _count: { affid: 'desc' } } }),
      prisma.cartEvent.count({ where: whereBase }),
      prisma.cartEvent.aggregate({ where: whereBase, _sum: { cartValue: true } }),
      prisma.purchaseEvent.count({ where: whereBase }),
      prisma.purchaseEvent.aggregate({ where: whereBase, _sum: { revenue: true } }),
    ])

    return NextResponse.json({
      period: { days, from: since.toISOString(), to: new Date().toISOString() },
      affid: affid || 'all',
      summary: {
        pageViews,
        clicks,
        scrollEvents: scrollSessions,
        leads,
        carts,
        purchases,
        cartRevenueDollars: ((cartRevenue._sum.cartValue || 0) / 100).toFixed(2),
        purchaseRevenueDollars: ((purchaseRevenue._sum.revenue || 0) / 100).toFixed(2),
      },
      pageViewsByPage,
      clicksByType,
      clicksById,
      leadsByAffid,
    })
  } catch (error: any) {
    console.error('[track/dashboard] GET Error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
