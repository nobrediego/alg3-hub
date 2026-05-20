import { NextRequest, NextResponse } from 'next/server'
import { getExportStatus } from '@/lib/api/canva'
import { getDesignStatus } from '@/lib/api/lovart'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const provider = searchParams.get('provider')
    const id = searchParams.get('id')

    if (!provider || !id) {
      return NextResponse.json(
        { error: 'provider e id sao obrigatorios' },
        { status: 400 }
      )
    }

    switch (provider) {
      case 'canva': {
        const job = await getExportStatus(id)
        return NextResponse.json({
          provider: 'canva',
          id: job.id,
          status: job.status === 'success'
            ? 'completed'
            : job.status === 'failed'
              ? 'failed'
              : 'processing',
          result: job,
        })
      }

      case 'lovart': {
        const design = await getDesignStatus(id)
        return NextResponse.json({
          provider: 'lovart',
          id: design.id,
          status: design.status,
          result: design,
        })
      }

      case 'gpt-image': {
        return NextResponse.json({
          provider: 'gpt-image',
          id,
          status: 'completed',
          result: null,
        })
      }

      default:
        return NextResponse.json(
          { error: `Provider "${provider}" nao suportado` },
          { status: 400 }
        )
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
