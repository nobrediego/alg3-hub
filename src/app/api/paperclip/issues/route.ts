import { NextRequest, NextResponse } from 'next/server'
import { createIssue } from '@/lib/api/paperclip'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.title || !body.description) {
      return NextResponse.json({ error: 'title and description are required' }, { status: 400 })
    }

    const data = await createIssue({
      title: body.title,
      description: body.description,
      priority: body.priority,
      assignee_id: body.assignee_id,
    })
    return NextResponse.json(data)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
