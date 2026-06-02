'use client'

import { api } from '@shared/api'

export interface ReferralSummary {
  invited: number
  invited_paid: number
  balance_minor: number
  total_earned_minor: number
  total_withdrawn_minor: number
  pending_minor: number
  commission_percent: number
  min_withdrawal_minor: number
  deep_link: string
}

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected'

export interface Withdrawal {
  id: number
  amount_minor: number
  details: string
  status: WithdrawalStatus
  admin_note: string
  created_at: string
  decided_at?: string
  user_id?: number
  username?: string
  telegram_id?: number
}

export interface ReferralMe {
  summary: ReferralSummary
  withdrawals: Withdrawal[]
}

export function fetchReferralMe(): Promise<ReferralMe> {
  return api<ReferralMe>('/api/v1/referrals/me')
}

export function createWithdrawal(amountMinor: number, details: string): Promise<Withdrawal> {
  return api<Withdrawal>('/api/v1/referrals/withdrawals', {
    method: 'POST',
    body: JSON.stringify({ amount_minor: amountMinor, details }),
  })
}

interface WithdrawalListResponse {
  items: Withdrawal[]
}

export async function listWithdrawals(onlyPending: boolean): Promise<Withdrawal[]> {
  const r = await api<WithdrawalListResponse>(
    `/api/v1/admin/referrals/withdrawals${onlyPending ? '?status=pending' : ''}`,
  )
  return r.items ?? []
}

export function approveWithdrawal(id: number, note: string): Promise<Withdrawal> {
  return api<Withdrawal>(`/api/v1/admin/referrals/withdrawals/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  })
}

export function rejectWithdrawal(id: number, note: string): Promise<Withdrawal> {
  return api<Withdrawal>(`/api/v1/admin/referrals/withdrawals/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  })
}
