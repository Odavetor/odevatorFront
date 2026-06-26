import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { verifyAdmin } from '../../_auth'

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '')

// POST /api/admin/content/faq — создать новый FAQ-итем + revalidateTag('content')
export async function POST(req: NextRequest) {
  const check = await verifyAdmin(req)
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status })
  const auth = check.auth
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
