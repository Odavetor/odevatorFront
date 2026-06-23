import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '')

export async function PUT(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  if (!BASE_URL) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_API_BASE_URL is not set' }, { status: 503 })
  }
  const { slug } = await ctx.params
  const auth = req.headers.get('authorization') ?? ''
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.text()
  const langParam = req.nextUrl.searchParams.get('lang') ?? 'ru'
  const lang = ['ru', 'en', 'de'].includes(langParam) ? langParam : 'ru'

  const r = await fetch(
    `${BASE_URL}/api/v1/admin/content/legal/${encodeURIComponent(slug)}?lang=${lang}`,
    {
      method: 'PUT',
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
