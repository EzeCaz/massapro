import { NextRequest, NextResponse } from 'next/server'
import prisma, { ensureDb } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    await ensureDb()
    const body = await req.json()
    const {
      sessionId,
      affid = 'no_affiliate',
      name,
      email,
      phone,
      company,
      companyUrl,
      planType,
      message,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
    } = body

    if (!sessionId || !name || !email) {
      return NextResponse.json({ error: 'sessionId, name, and email are required' }, { status: 400 })
    }

    const lead = await prisma.lead.create({
      data: {
        sessionId,
        affid,
        name,
        email,
        phone: phone || null,
        company: company || null,
        companyUrl: companyUrl || null,
        planType: planType || null,
        message: message || null,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        utmContent: utmContent || null,
        utmTerm: utmTerm || null,
      },
    })

    return NextResponse.json({ success: true, id: lead.id })
  } catch (error: any) {
    console.error('[track/lead] Error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET: retrieve lead stats
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

    const [total, byAffid, byPlanType, recent] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.groupBy({ by: ['affid'], where, _count: true, orderBy: { _count: { affid: 'desc' } } }),
      prisma.lead.groupBy({ by: ['planType'], where, _count: true, orderBy: { _count: { planType: 'desc' } } }),
      prisma.lead.findMany({ where, take: 20, orderBy: { createdAt: 'desc' } }),
    ])

    return NextResponse.json({ total, byAffid, byPlanType, recent, days })
  } catch (error: any) {
    console.error('[track/lead] GET Error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
