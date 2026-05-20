const UTMIFY_BASE = 'https://api.utmify.com.br'

export async function getSales(params?: { start_date?: string; end_date?: string; page?: number }) {
  const token = process.env.UTMIFY_API_TOKEN
  if (!token) throw new Error('UTMIFY_API_TOKEN not configured')

  const searchParams = new URLSearchParams()
  if (params?.start_date) searchParams.set('start_date', params.start_date)
  if (params?.end_date) searchParams.set('end_date', params.end_date)
  if (params?.page) searchParams.set('page', String(params.page))

  const url = `${UTMIFY_BASE}/api/sales?${searchParams.toString()}`
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error(`Utmify API error: ${res.status}`)
  return res.json()
}
