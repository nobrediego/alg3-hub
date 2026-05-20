// ---------------------------------------------------------------------------
// Canva Connect API Wrapper
// ---------------------------------------------------------------------------

const CANVA_BASE_URL = 'https://api.canva.com/rest'

function getAccessToken(): string {
  const token = process.env.CANVA_ACCESS_TOKEN
  if (!token) {
    throw new Error('Canva: CANVA_ACCESS_TOKEN nao configurado')
  }
  return token
}

async function canvaFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = getAccessToken()

  const response = await fetch(`${CANVA_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      `Canva API Error (${response.status}): ${data.message ?? JSON.stringify(data)}`
    )
  }

  return data as T
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CanvaDesign {
  id: string
  title: string
  editUrl: string
  viewUrl: string
  thumbnailUrl: string
  createdAt: number
  updatedAt: number
  pageCount?: number
}

export interface CanvaExportJob {
  id: string
  status: 'in_progress' | 'success' | 'failed'
  urls?: Array<{ url: string; page: number }>
  error?: string
}

export interface CanvaBrandTemplate {
  id: string
  title: string
  thumbnailUrl: string
  createdAt: number
  updatedAt: number
}

interface CanvaApiDesignResponse {
  design: {
    id: string
    title: string
    urls: { edit_url: string; view_url: string }
    thumbnail?: { url: string; width: number; height: number }
    created_at: number
    updated_at: number
    page_count?: number
  }
}

interface CanvaApiExportResponse {
  job: {
    id: string
    status: string
    urls?: Array<{ url: string; page: number }>
    error?: { code: string; message: string }
  }
}

interface CanvaApiListResponse<T> {
  items: T[]
  continuation?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapDesign(d: CanvaApiDesignResponse['design']): CanvaDesign {
  return {
    id: d.id,
    title: d.title,
    editUrl: d.urls.edit_url,
    viewUrl: d.urls.view_url,
    thumbnailUrl: d.thumbnail?.url ?? '',
    createdAt: d.created_at,
    updatedAt: d.updated_at,
    pageCount: d.page_count,
  }
}

// ---------------------------------------------------------------------------
// Designs
// ---------------------------------------------------------------------------

export async function listDesigns(): Promise<CanvaDesign[]> {
  const response = await canvaFetch<
    CanvaApiListResponse<CanvaApiDesignResponse['design']>
  >('/v1/designs')

  return response.items.map(mapDesign)
}

export async function createDesign(params: {
  title?: string
  designType?: 'doc' | 'presentation' | 'whiteboard' | 'custom'
  width?: number
  height?: number
}): Promise<CanvaDesign> {
  const body: Record<string, unknown> = {}

  if (params.designType === 'custom' && params.width && params.height) {
    body.design_type = {
      type: 'custom',
      width: params.width,
      height: params.height,
    }
  } else if (params.designType && params.designType !== 'custom') {
    body.design_type = { type: 'preset', name: params.designType }
  }

  if (params.title) {
    body.title = params.title
  }

  const response = await canvaFetch<CanvaApiDesignResponse>('/v1/designs', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  return mapDesign(response.design)
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export async function exportDesign(
  designId: string,
  format: 'png' | 'jpg' | 'pdf' | 'pptx' | 'mp4' | 'gif' = 'png'
): Promise<CanvaExportJob> {
  const response = await canvaFetch<CanvaApiExportResponse>(
    '/v1/designs/' + designId + '/exports',
    {
      method: 'POST',
      body: JSON.stringify({ format: { type: format } }),
    }
  )

  return {
    id: response.job.id,
    status: response.job.status as CanvaExportJob['status'],
    urls: response.job.urls,
    error: response.job.error?.message,
  }
}

export async function getExportStatus(exportId: string): Promise<CanvaExportJob> {
  const response = await canvaFetch<CanvaApiExportResponse>(
    `/v1/exports/${exportId}`
  )

  return {
    id: response.job.id,
    status: response.job.status as CanvaExportJob['status'],
    urls: response.job.urls,
    error: response.job.error?.message,
  }
}

// ---------------------------------------------------------------------------
// Brand Templates
// ---------------------------------------------------------------------------

export async function listBrandTemplates(): Promise<CanvaBrandTemplate[]> {
  const response = await canvaFetch<
    CanvaApiListResponse<{
      id: string
      title: string
      thumbnail: { url: string }
      created_at: number
      updated_at: number
    }>
  >('/v1/brand-templates')

  return response.items.map((t) => ({
    id: t.id,
    title: t.title,
    thumbnailUrl: t.thumbnail?.url ?? '',
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  }))
}

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------

export async function uploadAsset(
  file: { name: string; base64: string; mimeType: string }
): Promise<{ assetId: string }> {
  const response = await canvaFetch<{ asset: { id: string } }>(
    '/v1/assets/upload',
    {
      method: 'POST',
      body: JSON.stringify({
        name: file.name,
        data: file.base64,
        mime_type: file.mimeType,
      }),
    }
  )

  return { assetId: response.asset.id }
}
