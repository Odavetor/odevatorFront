import { NextRequest, NextResponse } from 'next/server'

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '')

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params
  if (!BASE_URL) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }
  try {
    const res = await fetch(`${BASE_URL}/api/v1/content/legal/${encodeURIComponent(slug)}`, {
      next: { tags: ['content'], revalidate: 300 },
    })
    const text = await res.text()
    return new NextResponse(text || null, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('content-type') ?? 'application/json',
        'Cache-Control': 'public, max-age=15, stale-while-revalidate=60',
      },
    })
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 502 })
  }
}
