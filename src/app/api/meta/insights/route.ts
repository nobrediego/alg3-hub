import { NextRequest, NextResponse } from 'next/server'
import { getAccountInsights, META_ACCOUNTS } from '@/lib/api/meta-ads'

export async function GET(req: NextRequest) {
  const accountId = req.nextUrl.searchParams.get('account_id')
  const datePreset = req.nextUrl.searchParams.get('date_preset') || 'last_30d'

  const account = META_ACCOUNTS.find(a => a.accountId === accountId || a.id === accountId)
  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 400 })
  }

  try {
    const data = await getAccountInsights(account.accountId, account.envTokenKey, datePreset)
    return NextResponse.json(data)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
