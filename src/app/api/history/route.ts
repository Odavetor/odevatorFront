import { NextRequest, NextResponse } from 'next/server'
import * as db from '@/lib/db'
import { MOCK_HISTORY } from '@/lib/mock'

const BOT_TOKEN = process.env.BOT_TOKEN ?? ''
const MAX_PER_PAGE = 20
const USE_MOCK = process.env.USE_MOCK === 'true'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const page = Math.max(1, Number(sp.get('page') ?? '1'))
  const perPage = Math.min(MAX_PER_PAGE, Math.max(1, Number(sp.get('perPage') ?? '10')))

  if (USE_MOCK) {
    const start = (page - 1) * perPage
    const items = MOCK_HISTORY.slice(start, start + perPage)
    return NextResponse.json({ items, total: MOCK_HISTORY.length, page, perPage })
  }

  const userId = Number(sp.get('userId'))
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  const items = db.getHistory(userId, BOT_TOKEN, page, perPage)
  const total = db.countHistory(userId, BOT_TOKEN)

  const enriched = items.map((item) => {
    const expiry = new Date(item.created_at).getTime() + 3 * 24 * 60 * 60 * 1000
    const diffMs = expiry - Date.now()
    return { ...item, expires_in_hours: Math.max(0, Math.round(diffMs / 3_600_000)) }
  })

  return NextResponse.json({ items: enriched, total, page, perPage })
}
