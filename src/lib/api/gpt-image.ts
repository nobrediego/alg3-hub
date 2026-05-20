// ---------------------------------------------------------------------------
// OpenAI GPT Image Wrapper (gpt-image-1)
// ---------------------------------------------------------------------------

import OpenAI from 'openai'

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('GPT Image: OPENAI_API_KEY nao configurada')
  }
  return new OpenAI({ apiKey })
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GPTImage {
  url?: string
  b64Json?: string
  revisedPrompt?: string
}

export interface GPTImageResult {
  images: GPTImage[]
  model: string
  prompt: string
  createdAt: string
}

// ---------------------------------------------------------------------------
// Image Generation
// ---------------------------------------------------------------------------

export async function generateImage(
  prompt: string,
  size: '1024x1024' | '1024x1536' | '1536x1024' = '1024x1024',
  quality: 'low' | 'medium' | 'high' | 'auto' = 'high',
  style?: 'vivid' | 'natural'
): Promise<GPTImageResult> {
  const client = getClient()

  const response = await client.images.generate({
    model: 'gpt-image-1',
    prompt,
    n: 1,
    size,
    quality,
  } as Parameters<typeof client.images.generate>[0])

  const data = 'data' in response ? response.data : []

  return {
    images: (data ?? []).map((img) => ({
      url: img.url ?? undefined,
      b64Json: img.b64_json ?? undefined,
      revisedPrompt: img.revised_prompt ?? undefined,
    })),
    model: 'gpt-image-1',
    prompt,
    createdAt: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Image Edit (inpainting)
// ---------------------------------------------------------------------------

export async function editImage(
  image: string,
  prompt: string,
  mask?: string
): Promise<GPTImageResult> {
  const client = getClient()

  const params: Record<string, unknown> = {
    model: 'gpt-image-1',
    prompt,
    image,
    n: 1,
  }

  if (mask) {
    params.mask = mask
  }

  const response = await client.images.edit(
    params as unknown as Parameters<typeof client.images.edit>[0]
  )

  const data = 'data' in response ? response.data : []

  return {
    images: (data ?? []).map((img) => ({
      url: img.url ?? undefined,
      b64Json: img.b64_json ?? undefined,
      revisedPrompt: img.revised_prompt ?? undefined,
    })),
    model: 'gpt-image-1',
    prompt,
    createdAt: new Date().toISOString(),
  }
}
