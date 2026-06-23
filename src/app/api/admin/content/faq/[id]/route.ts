import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { verifyAdmin } from '../../../_auth'

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '')

async function proxy(method: 'PATCH' | 'DELETE', req: NextRequest, id: string) {
  const check = await verifyAdmin(req)
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status })
  const auth = check.auth

  const init: RequestInit = {
    method,
    headers: {
      Authorization: auth,
    },
    cache: 'no-store',
  }
  if (method === 'PATCH') {
    init.headers = { ...init.headers, 'Content-Type': 'application/json' }
    init.body = await req.text()
  }
  const langParam = req.nextUrl.searchParams.get('lang') ?? 'ru'
  const lang = ['ru', 'en', 'de'].includes(langParam) ? langParam : 'ru'

  const r = await fetch(
    `${BASE_URL}/api/v1/admin/content/faq/${encodeURIComponent(id)}?lang=${lang}`,
    init,
  )
  if (r.ok) revalidateTag('content')

  const text = await r.text()
  return new NextResponse(text || null, {
    status: r.status,
    headers: { 'Content-Type': r.headers.get('content-type') ?? 'application/json' },
  })
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  return proxy('PATCH', req, id)
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  return proxy('DELETE', req, id)
}
