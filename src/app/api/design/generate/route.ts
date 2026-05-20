import { NextRequest, NextResponse } from 'next/server'
import { createDesign } from '@/lib/api/canva'
import { generateDesign as lovartGenerate } from '@/lib/api/lovart'
import { generateImage } from '@/lib/api/gpt-image'

interface GenerateBody {
  provider: 'canva' | 'lovart' | 'gpt-image'
  prompt: string
  options?: {
    style?: string
    size?: string
    format?: string
    title?: string
    designType?: 'doc' | 'presentation' | 'whiteboard' | 'custom'
    width?: number
    height?: number
    quality?: 'low' | 'medium' | 'high' | 'auto'
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateBody

    if (!body.provider || !body.prompt) {
      return NextResponse.json(
        { error: 'provider e prompt sao obrigatorios' },
        { status: 400 }
      )
    }

    switch (body.provider) {
      case 'canva': {
        const design = await createDesign({
          title: body.options?.title ?? body.prompt.slice(0, 100),
          designType: body.options?.designType ?? 'custom',
          width: body.options?.width ?? 1080,
          height: body.options?.height ?? 1080,
        })
        return NextResponse.json({
          provider: 'canva',
          id: design.id,
          status: 'completed',
          result: design,
        })
      }

      case 'lovart': {
        const sizeMap: Record<string, { width: number; height: number }> = {
          '1024x1024': { width: 1024, height: 1024 },
          '1024x1536': { width: 1024, height: 1536 },
          '1536x1024': { width: 1536, height: 1024 },
        }
        const dimensions = sizeMap[body.options?.size ?? ''] ?? {
          width: body.options?.width ?? 1024,
          height: body.options?.height ?? 1024,
        }

        const design = await lovartGenerate({
          prompt: body.prompt,
          style: (body.options?.style as 'bold-modern') ?? 'bold-modern',
          dimensions,
          format: (body.options?.format as 'png') ?? 'png',
        })
        return NextResponse.json({
          provider: 'lovart',
          id: design.id,
          status: design.status,
          result: design,
        })
      }

      case 'gpt-image': {
        const size = (body.options?.size ?? '1024x1024') as
          | '1024x1024'
          | '1024x1536'
          | '1536x1024'
        const quality = body.options?.quality ?? 'high'

        const result = await generateImage(body.prompt, size, quality)
        return NextResponse.json({
          provider: 'gpt-image',
          id: `gpt_${Date.now()}`,
          status: 'completed',
          result,
        })
      }

      default:
        return NextResponse.json(
          { error: `Provider "${body.provider}" nao suportado` },
          { status: 400 }
        )
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
