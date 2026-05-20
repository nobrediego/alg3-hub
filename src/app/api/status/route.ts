import { NextResponse } from 'next/server'

export async function GET() {
  const statuses: Record<string, { configured: boolean; connected?: boolean; error?: string }> = {}

  // Meta Ads
  statuses.meta = { configured: !!process.env.META_ACCESS_TOKEN }
  if (statuses.meta.configured) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/act_1318032568658074?fields=name&access_token=${process.env.META_ACCESS_TOKEN}`,
        { cache: 'no-store' }
      )
      statuses.meta.connected = res.ok
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        statuses.meta.error = err.error?.message || `HTTP ${res.status}`
      }
    } catch (e) {
      statuses.meta.connected = false
      statuses.meta.error = e instanceof Error ? e.message : 'Connection failed'
    }
  }

  // Paperclip
  const paperclipUrl = process.env.PAPERCLIP_API_URL || 'http://127.0.0.1:3100/api'
  statuses.paperclip = { configured: !!process.env.PAPERCLIP_COMPANY_ID }
  if (statuses.paperclip.configured) {
    try {
      const res = await fetch(`${paperclipUrl}/health`, { cache: 'no-store' })
      statuses.paperclip.connected = res.ok
    } catch {
      statuses.paperclip.connected = false
      statuses.paperclip.error = 'Paperclip nao esta rodando'
    }
  }

  // Utmify (POST-only API, so we just check if token exists)
  statuses.utmify = { configured: !!process.env.UTMIFY_API_TOKEN, connected: !!process.env.UTMIFY_API_TOKEN }

  // OpenAI
  statuses.openai = { configured: !!process.env.OPENAI_API_KEY, connected: !!process.env.OPENAI_API_KEY }

  // OpenRouter
  statuses.openrouter = { configured: !!process.env.OPENROUTER_API_KEY, connected: !!process.env.OPENROUTER_API_KEY }

  // Supabase
  statuses.supabase = {
    configured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    connected: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  }

  // Canva
  statuses.canva = { configured: !!(process.env.CANVA_CLIENT_ID && process.env.CANVA_ACCESS_TOKEN) }
  if (statuses.canva.configured) {
    try {
      const res = await fetch('https://api.canva.com/rest/v1/users/me', {
        headers: { Authorization: `Bearer ${process.env.CANVA_ACCESS_TOKEN}` },
        cache: 'no-store',
      })
      statuses.canva.connected = res.ok
      if (!res.ok) statuses.canva.error = 'Token expirado'
    } catch {
      statuses.canva.connected = false
    }
  }

  // Lovart
  statuses.lovart = {
    configured: !!(process.env.LOVART_ACCESS_KEY && process.env.LOVART_SECRET_KEY),
    connected: !!(process.env.LOVART_ACCESS_KEY && process.env.LOVART_SECRET_KEY),
  }

  return NextResponse.json(statuses)
}
