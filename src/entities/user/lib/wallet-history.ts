'use client'

import type { LedgerEntry, PagedResponse, PaymentTx } from '@shared/api'
import { IS_DEV, isMockEnabled, MOCK_LEDGER, MOCK_PAYMENTS } from '@shared/lib'
import { getLedger, getPaymentHistory } from '@entities/user/api/wallet'

const DEFAULT_PAGE = 10

function paginate<T extends { id: number }>(
  items: T[],
  limit: number,
  beforeId?: number,
): PagedResponse<T> {
  const start = beforeId ? items.findIndex((it) => it.id < beforeId) : 0
  const startIndex = start === -1 ? items.length : start
  const slice = items.slice(startIndex, startIndex + limit)
  const next = slice.length === limit ? slice[slice.length - 1]?.id : undefined
  return { items: slice, next_before_id: next }
}

export async function fetchLedger(
  opts: { limit?: number; before_id?: number } = {},
): Promise<PagedResponse<LedgerEntry>> {
  const limit = opts.limit ?? DEFAULT_PAGE
  if (isMockEnabled()) {
    return paginate(MOCK_LEDGER, limit, opts.before_id)
  }
  if (!IS_DEV && !process.env.NEXT_PUBLIC_API_BASE_URL) {
    return { items: [] }
  }
  try {
    return await getLedger({ limit, before_id: opts.before_id })
  } catch {
    return { items: [] }
  }
}

export async function fetchPayments(
  opts: { limit?: number; before_id?: number } = {},
): Promise<PagedResponse<PaymentTx>> {
  const limit = opts.limit ?? DEFAULT_PAGE
  if (isMockEnabled()) {
    return paginate(MOCK_PAYMENTS, limit, opts.before_id)
  }
  if (!IS_DEV && !process.env.NEXT_PUBLIC_API_BASE_URL) {
    return { items: [] }
  }
  try {
    return await getPaymentHistory({ limit, before_id: opts.before_id })
  } catch {
    return { items: [] }
  }
}
