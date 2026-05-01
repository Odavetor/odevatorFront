import { NextRequest, NextResponse } from 'next/server'
import * as db from '@/lib/db'
import { MOCK_USER } from '@/lib/mock'

const BOT_TOKEN = process.env.BOT_TOKEN ?? ''
const USE_MOCK = process.env.USE_MOCK === 'true'

export async function GET(req: NextRequest) {
  if (USE_MOCK) {
    return NextResponse.json({ data: MOCK_USER })
  }

  const userId = Number(req.nextUrl.searchParams.get('userId'))
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  const user = db.getUser(userId, BOT_TOKEN)
  if (!user) return NextResponse.json({ data: null })

  return NextResponse.json({
    data: {
      user_id: user.user_id,
      username: user.username,
      balance: user.balance,
      active_processes: user.active_processes,
      generations: user.generations,
      reg_date: user.reg_date,
    },
  })
}
