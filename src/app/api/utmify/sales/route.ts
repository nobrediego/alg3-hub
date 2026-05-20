import { NextRequest, NextResponse } from 'next/server'
import { getSales } from '@/lib/api/utmify'

export async function GET(req: NextRequest) {
  const startDate = req.nextUrl.searchParams.get('start_date') || undefined
  const endDate = req.nextUrl.searchParams.get('end_date') || undefined
  const page = req.nextUrl.searchParams.get('page')

  try {
    const data = await getSales({
      start_date: startDate,
      end_date: endDate,
      page: page ? parseInt(page, 10) : undefined,
    })
    return NextResponse.json(data)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
