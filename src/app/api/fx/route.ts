import { NextResponse } from 'next/server'

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '')

export async function GET() {
  if (!BASE_URL) {
    return NextResponse.json({ rates: { RUB: 1 } })
  }
  try {
    const res = await fetch(`${BASE_URL}/api/v1/fx`, { next: { revalidate: 300 } })
    if (!res.ok) {
      return NextResponse.json({ rates: { RUB: 1 } }, { status: 200 })
    }
    const data = await res.json()
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=120, stale-while-revalidate=600' },
    })
  } catch {
    return NextResponse.json({ rates: { RUB: 1 } })
  }
}
