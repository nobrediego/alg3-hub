import { NextResponse } from 'next/server'
import { getAgents } from '@/lib/api/paperclip'

export async function GET() {
  try {
    const data = await getAgents()
    return NextResponse.json(data)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
