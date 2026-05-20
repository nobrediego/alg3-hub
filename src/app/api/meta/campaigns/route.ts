import { NextRequest, NextResponse } from 'next/server'
import { getAccountCampaigns, META_ACCOUNTS } from '@/lib/api/meta-ads'

export async function GET(req: NextRequest) {
  const accountId = req.nextUrl.searchParams.get('account_id')
  const status = req.nextUrl.searchParams.get('status') || undefined
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50', 10)

  const account = META_ACCOUNTS.find(a => a.accountId === accountId || a.id === accountId)
  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 400 })
  }

  try {
    const data = await getAccountCampaigns(account.accountId, account.envTokenKey, status, limit)
    return NextResponse.json(data)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
