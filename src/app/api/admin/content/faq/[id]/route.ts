import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '')

async function proxy(method: 'PATCH' | 'DELETE', req: NextRequest, id: string) {
  if (!BASE_URL) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_API_BASE_URL is not set' }, { status: 503 })
  }
  const auth = req.headers.get('authorization') ?? ''
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

  const r = await fetch(`${BASE_URL}/api/v1/admin/content/faq/${encodeURIComponent(id)}`, init)
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
