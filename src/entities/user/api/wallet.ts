'use client'

import { api } from '@shared/api'
import type { LedgerEntry, PagedResponse, PaymentTx, WalletResponse } from '@shared/api'

export function getWallet(): Promise<WalletResponse> {
  return api<WalletResponse>('/api/v1/wallet')
}

export function getLedger(
  params: { limit?: number; before_id?: number } = {},
): Promise<PagedResponse<LedgerEntry>> {
  const qs = new URLSearchParams()
  if (params.limit) qs.set('limit', String(params.limit))
  if (params.before_id) qs.set('before_id', String(params.before_id))
  const tail = qs.toString() ? `?${qs.toString()}` : ''
  return api<PagedResponse<LedgerEntry>>(`/api/v1/wallet/ledger${tail}`)
}

export function getPaymentHistory(
  params: { limit?: number; before_id?: number } = {},
): Promise<PagedResponse<PaymentTx>> {
  const qs = new URLSearchParams()
  if (params.limit) qs.set('limit', String(params.limit))
  if (params.before_id) qs.set('before_id', String(params.before_id))
  const tail = qs.toString() ? `?${qs.toString()}` : ''
  return api<PagedResponse<PaymentTx>>(`/api/v1/payments${tail}`)
}
