import { NextResponse } from 'next/server'

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '')

// Публичный GET. Кеш данных Next-кеша теггирован 'content' →
// при админской записи мы дёргаем revalidateTag('content'),
// и следующий запрос пойдёт в Go-бэк за свежим состоянием.
export async function GET() {
  if (!BASE_URL) {
    return NextResponse.json({ strings: {}, faq: [] })
  }
  try {
    const res = await fetch(`${BASE_URL}/api/v1/content`, {
      next: { tags: ['content'], revalidate: 300 },
    })
    if (!res.ok) {
      return NextResponse.json({ strings: {}, faq: [] }, { status: 200 })
    }
    const data = await res.json()
    return NextResponse.json(data, {
      headers: {
        // Браузерный кеш — короткий, чтобы инвалидация чувствовалась быстро
        'Cache-Control': 'public, max-age=15, stale-while-revalidate=60',
      },
    })
  } catch {
    return NextResponse.json({ strings: {}, faq: [] })
  }
}
