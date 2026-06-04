import { NextResponse } from 'next/server'

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '')

export async function GET() {
  if (!BASE_URL) {
    return NextResponse.json({ documents: [] })
  }
  try {
    const res = await fetch(`${BASE_URL}/api/v1/content/legal`, {
      next: { tags: ['content'], revalidate: 300 },
    })
    if (!res.ok) {
      return NextResponse.json({ documents: [] }, { status: 200 })
    }
    const data = await res.json()
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=15, stale-while-revalidate=60' },
    })
  } catch {
    return NextResponse.json({ documents: [] })
  }
}
