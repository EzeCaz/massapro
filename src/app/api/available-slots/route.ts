import { NextResponse } from 'next/server'
import { getBookedSlots } from '@/lib/google-calendar'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Look ahead 8 weeks from now
    const now = new Date()
    const endDate = new Date(now)
    endDate.setDate(endDate.getDate() + 56) // 8 weeks

    const bookedRanges = await getBookedSlots(now.toISOString(), endDate.toISOString())

    return NextResponse.json({
      bookedRanges, // Array of { startMs, endMs } for precise overlap comparison
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in available-slots API:', error)
    return NextResponse.json(
      { bookedRanges: [], error: 'Failed to fetch available slots' },
      { status: 500 }
    )
  }
}
