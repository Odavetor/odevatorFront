'use client'

import type { JobSummary } from '@shared/api'
import { IS_DEV, isMockEnabled, MOCK_HISTORY } from '@shared/lib'
import { listJobHistory } from '@entities/generation/api/undress'
import type { HistoryItem } from '@entities/generation/types'

interface HistoryPage {
  items: HistoryItem[]
  total?: number
  next_before_id?: number
}

const HOUR_MS = 3_600_000
const TTL_HOURS = 72

function summaryToItem(s: JobSummary): HistoryItem | null {
  const results = (s.results as string[] | undefined) ?? []
  const url = Array.isArray(results) ? results[0] : undefined
  if (!url) return null
  const created = new Date(s.created_at).getTime()
  const ageH = Math.floor((Date.now() - created) / HOUR_MS)
  return {
    id: s.id,
    user_id: 0,
    bot_token: '',
    image_url: url,
    local_path: null,
    created_at: s.created_at,
    expires_in_hours: Math.max(0, TTL_HOURS - ageH),
  }
}

export async function fetchHistory(
  opts: {
    page?: number
    perPage?: number
    before_id?: number
    userId?: number
  } = {},
): Promise<HistoryPage> {
  if (isMockEnabled()) {
    const page = opts.page ?? 1
    const perPage = opts.perPage ?? 10
    const start = (page - 1) * perPage
    const items = MOCK_HISTORY.slice(start, start + perPage) as HistoryItem[]
    return { items, total: MOCK_HISTORY.length }
  }

  if (!IS_DEV && !process.env.NEXT_PUBLIC_API_BASE_URL) {
    return { items: [] }
  }

  try {
    const data = await listJobHistory({
      limit: opts.perPage ?? 10,
      before_id: opts.before_id,
    })
    return {
      items: data.items.map(summaryToItem).filter((x): x is HistoryItem => x !== null),
      next_before_id: data.next_before_id,
    }
  } catch {
    return { items: [] }
  }
}
