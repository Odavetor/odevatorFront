import { NextResponse } from 'next/server'

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '')

const LANGS = new Set(['ru', 'en', 'de'])
function langOf(url: string): string {
  const v = new URL(url).searchParams.get('lang') ?? 'ru'
  return LANGS.has(v) ? v : 'ru'
}

export async function GET(request: Request) {
  if (!BASE_URL) {
    return NextResponse.json({ documents: [] })
  }
  const lang = langOf(request.url)
  try {
    const res = await fetch(`${BASE_URL}/api/v1/content/legal?lang=${lang}`, {
      next: { tags: ['content', `content:${lang}`], revalidate: 300 },
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
