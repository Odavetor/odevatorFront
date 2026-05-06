import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '')

// POST /api/admin/content/faq — создать новый FAQ-итем + revalidateTag('content')
export async function POST(req: NextRequest) {
  if (!BASE_URL) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_API_BASE_URL is not set' }, { status: 503 })
  }
  const auth = req.headers.get('authorization') ?? ''
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.text()

  const r = await fetch(`${BASE_URL}/api/v1/admin/content/faq`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: auth,
    },
    body,
    cache: 'no-store',
  })

  if (r.ok) revalidateTag('content')

  const text = await r.text()
  return new NextResponse(text || null, {
    status: r.status,
    headers: { 'Content-Type': r.headers.get('content-type') ?? 'application/json' },
  })
}
