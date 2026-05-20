// ---------------------------------------------------------------------------
// Lovart AI API Wrapper
// ---------------------------------------------------------------------------

const LOVART_BASE_URL = 'https://api.lovart.ai/v1'

function getConfig() {
  const accessKey = process.env.LOVART_ACCESS_KEY
  const secretKey = process.env.LOVART_SECRET_KEY

  if (!accessKey || !secretKey) {
    throw new Error('Lovart: LOVART_ACCESS_KEY e LOVART_SECRET_KEY nao configurados')
  }

  return { accessKey, secretKey }
}

async function lovartFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const { accessKey, secretKey } = getConfig()

  const response = await fetch(`${LOVART_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Key': accessKey,
      'X-Secret-Key': secretKey,
      ...options?.headers,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      `Lovart API Error (${response.status}): ${data.message ?? data.error ?? JSON.stringify(data)}`
    )
  }

  return data as T
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LovartDesign {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  prompt: string
  style: string
  imageUrl: string | null
  thumbnailUrl: string | null
  createdAt: string
}

export interface LovartTemplate {
  id: string
  name: string
  category: string
  previewUrl: string
}

export interface LovartUsage {
  creditsUsed: number
  creditsRemaining: number
  plan: string
  generationsThisMonth: number
}

export type LovartStyle =
  | 'bold-modern'
  | 'minimal'
  | 'elegant'
  | 'playful'
  | 'vintage'
  | 'corporate'
  | 'hand-drawn'
  | 'geometric'
  | 'gradient'
  | 'neon'
  | 'natural'
  | 'tech'
  | 'luxury'
  | 'flat'
  | 'custom'

// ---------------------------------------------------------------------------
// Design Generation
// ---------------------------------------------------------------------------

export async function generateDesign(params: {
  prompt: string
  style?: LovartStyle
  dimensions?: { width: number; height: number }
  format?: 'png' | 'jpg' | 'svg' | 'webp'
}): Promise<LovartDesign> {
  const response = await lovartFetch<{
    design_id?: string
    id?: string
    status?: string
    image_url?: string
    output_url?: string
    created_at?: string
  }>('/design/generate', {
    method: 'POST',
    body: JSON.stringify({
      prompt: params.prompt,
      style: params.style ?? 'bold-modern',
      format: params.format ?? 'png',
      width: params.dimensions?.width ?? 1024,
      height: params.dimensions?.height ?? 1024,
    }),
  })

  return {
    id: response.design_id ?? response.id ?? `lov_${Date.now()}`,
    status: (response.status as LovartDesign['status']) ?? 'processing',
    prompt: params.prompt,
    style: params.style ?? 'bold-modern',
    imageUrl: response.image_url ?? response.output_url ?? null,
    thumbnailUrl: null,
    createdAt: response.created_at ?? new Date().toISOString(),
  }
}

export async function getDesignStatus(id: string): Promise<LovartDesign> {
  const response = await lovartFetch<{
    design_id?: string
    id?: string
    status?: string
    prompt?: string
    style?: string
    image_url?: string
    output_url?: string
    thumbnail_url?: string
    created_at?: string
  }>(`/design/${id}`)

  return {
    id: response.design_id ?? response.id ?? id,
    status: (response.status as LovartDesign['status']) ?? 'pending',
    prompt: response.prompt ?? '',
    style: response.style ?? '',
    imageUrl: response.image_url ?? response.output_url ?? null,
    thumbnailUrl: response.thumbnail_url ?? null,
    createdAt: response.created_at ?? '',
  }
}

// ---------------------------------------------------------------------------
// Image Enhancement
// ---------------------------------------------------------------------------

export async function enhanceImage(
  imageUrl: string,
  scale: '2x' | '4x' = '2x'
): Promise<{ imageUrl: string }> {
  const response = await lovartFetch<{
    image_url?: string
    output_url?: string
  }>('/image/enhance', {
    method: 'POST',
    body: JSON.stringify({
      image_url: imageUrl,
      scale,
    }),
  })

  return { imageUrl: response.image_url ?? response.output_url ?? '' }
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export async function listTemplates(
  category?: string
): Promise<LovartTemplate[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : ''

  const response = await lovartFetch<{
    templates?: Array<{
      id: string
      name: string
      category: string
      preview_url?: string
    }>
    data?: Array<{
      id: string
      name: string
      category: string
      preview_url?: string
    }>
  }>(`/templates${query}`)

  const items = response.templates ?? response.data ?? []

  return items.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    previewUrl: t.preview_url ?? '',
  }))
}

// ---------------------------------------------------------------------------
// Usage
// ---------------------------------------------------------------------------

export async function getUsage(): Promise<LovartUsage> {
  const response = await lovartFetch<{
    credits_used?: number
    credits_remaining?: number
    plan?: string
    generations_this_month?: number
  }>('/user/usage')

  return {
    creditsUsed: response.credits_used ?? 0,
    creditsRemaining: response.credits_remaining ?? 0,
    plan: response.plan ?? 'unknown',
    generationsThisMonth: response.generations_this_month ?? 0,
  }
}
