import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      sessionId,
      affid = 'no_affiliate',
      planType,   // "Basic", "Professional", "Enterprise"
      cartValue,  // Price in USD (500, 1200, 2000)
      page,
    } = body

    if (!sessionId || !planType || cartValue === undefined) {
      return NextResponse.json({ error: 'sessionId, planType, and cartValue are required' }, { status: 400 })
    }

    const cart = await prisma.cartEvent.create({
      data: {
        sessionId,
        affid,
        planType,
        cartValue: parseInt(String(cartValue)) * 100, // Store in cents
        page: page || '/all',
      },
    })

    return NextResponse.json({ success: true, id: cart.id })
  } catch (error: any) {
    console.error('[track/cart] Error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET: retrieve cart stats
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '7')
    const affid = searchParams.get('affid')

    const since = new Date()
    since.setDate(since.getDate() - days)

    const where: any = { createdAt: { gte: since } }
    if (affid) where.affid = affid

    const [total, byPlanType, byAffid, totalRevenue] = await Promise.all([
      prisma.cartEvent.count({ where }),
      prisma.cartEvent.groupBy({ by: ['planType'], where, _count: true, _sum: { cartValue: true }, orderBy: { _count: { planType: 'desc' } } }),
      prisma.cartEvent.groupBy({ by: ['affid'], where, _count: true, _sum: { cartValue: true }, orderBy: { _count: { affid: 'desc' } } }),
      prisma.cartEvent.aggregate({ where, _sum: { cartValue: true } }),
    ])

    return NextResponse.json({
      total,
      byPlanType,
      byAffid,
      totalRevenueCents: totalRevenue._sum.cartValue || 0,
      totalRevenueDollars: ((totalRevenue._sum.cartValue || 0) / 100).toFixed(2),
      days,
    })
  } catch (error: any) {
    console.error('[track/cart] GET Error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
