const PAPERCLIP_URL = process.env.PAPERCLIP_API_URL || 'http://127.0.0.1:3100/api'
const COMPANY_ID = process.env.PAPERCLIP_COMPANY_ID || ''

export async function getAgents() {
  const res = await fetch(`${PAPERCLIP_URL}/companies/${COMPANY_ID}/agents`, {
    next: { revalidate: 30 },
  })
  if (!res.ok) throw new Error(`Paperclip agents error: ${res.status}`)
  return res.json()
}

export async function getDashboard() {
  const res = await fetch(`${PAPERCLIP_URL}/companies/${COMPANY_ID}/dashboard`, {
    next: { revalidate: 30 },
  })
  if (!res.ok) throw new Error(`Paperclip dashboard error: ${res.status}`)
  return res.json()
}

export async function createIssue(data: { title: string; description: string; priority?: string; assignee_id?: string }) {
  const res = await fetch(`${PAPERCLIP_URL}/companies/${COMPANY_ID}/issues`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Paperclip create issue error: ${res.status}`)
  return res.json()
}
