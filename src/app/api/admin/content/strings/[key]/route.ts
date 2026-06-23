import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { verifyAdmin } from '../../../_auth'

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '')

// PATCH /api/admin/content/strings/{key}
// Прокси на Go-бэк + revalidateTag('content') после успеха.
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ key: string }> }) {
  const check = await verifyAdmin(req)
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status })
  const auth = check.auth
  const { key } = await ctx.params
  const body = await req.text()
  const langParam = req.nextUrl.searchParams.get('lang') ?? 'ru'
  const lang = ['ru', 'en', 'de'].includes(langParam) ? langParam : 'ru'

  const r = await fetch(
    `${BASE_URL}/api/v1/admin/content/strings/${encodeURIComponent(key)}?lang=${lang}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
      },
      body,
      cache: 'no-store',
    },
  )

  if (r.ok) revalidateTag('content')

  const text = await r.text()
  return new NextResponse(text || null, {
    status: r.status,
    headers: { 'Content-Type': r.headers.get('content-type') ?? 'application/json' },
  })
}
