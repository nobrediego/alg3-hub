const META_API_VERSION = 'v21.0'
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`

export const META_ACCOUNTS: Array<{
  id: string
  name: string
  accountId: string
  envAccountKey: string
  envTokenKey: string
}> = [
  { id: 'senai', name: 'SENAI NOVA', accountId: 'act_1318032568658074', envAccountKey: 'META_AD_ACCOUNT_ID', envTokenKey: 'META_ACCESS_TOKEN' },
  { id: 'sesi', name: 'SESI AMAZONAS', accountId: 'act_103647143172752', envAccountKey: 'META_AD_ACCOUNT_ID_SESI', envTokenKey: 'META_ACCESS_TOKEN_SESI' },
  { id: 'sesi_escola', name: 'SESI ESCOLA', accountId: 'act_172742621703309', envAccountKey: 'META_AD_ACCOUNT_ID_SESI_ESCOLA', envTokenKey: 'META_ACCESS_TOKEN' },
  { id: 'sesi_saude', name: 'SESI SAUDE', accountId: 'act_447781743367534', envAccountKey: 'META_AD_ACCOUNT_ID_SESI_SAUDE', envTokenKey: 'META_ACCESS_TOKEN' },
  { id: 'sesi_lazer', name: 'SESI LAZER', accountId: 'act_198656655774871', envAccountKey: 'META_AD_ACCOUNT_ID_SESI_LAZER', envTokenKey: 'META_ACCESS_TOKEN' },
]

function getToken(tokenKey: string): string {
  const token = process.env[tokenKey] || process.env.META_ACCESS_TOKEN
  if (!token) throw new Error('Meta access token not configured')
  return token
}

export async function getAccountInsights(accountId: string, tokenKey: string, datePreset = 'last_30d') {
  const token = getToken(tokenKey)
  const fields = 'spend,impressions,clicks,ctr,cpc,cpm,reach'
  const url = `${META_BASE_URL}/${accountId}/insights?fields=${fields}&date_preset=${datePreset}&access_token=${token}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Meta API error ${res.status}`)
  }
  return res.json()
}

export async function getAccountCampaigns(accountId: string, tokenKey: string, status?: string, limit = 50) {
  const token = getToken(tokenKey)
  const fields = 'name,status,objective,daily_budget,lifetime_budget'
  let url = `${META_BASE_URL}/${accountId}/campaigns?fields=${fields}&limit=${limit}&access_token=${token}`
  if (status) url += `&filtering=[{"field":"effective_status","operator":"IN","value":["${status}"]}]`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Meta API error ${res.status}`)
  }
  return res.json()
}
