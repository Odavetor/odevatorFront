'use client'

import { api } from '@shared/api'

export interface ReferralSummary {
  invited: number
  invited_paid: number
  clicks: number
  unique_visitors: number
  balance_minor: number
  total_earned_minor: number
  total_withdrawn_minor: number
  pending_minor: number
  earned_today_minor: number
  earned_7d_minor: number
  earned_30d_minor: number
  earned_purchase_minor: number
  earned_gen_minor: number
  commission_percent: number
  min_withdrawal_minor: number
  deep_link: string
}

export interface EarningsPoint {
  date: string
  amount_minor: number
}

export interface CountPoint {
  date: string
  count: number
}

export type CommissionSource = 'purchase' | 'generation'

export interface CommissionEvent {
  amount_minor: number
  source: CommissionSource
  created_at: string
}

export interface ReferralTier {
  name: string
  level: number
  paid_referrals: number
  next_name: string
  next_at: number
  progress: number
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
  tier: ReferralTier
  earnings_series: EarningsPoint[]
  signups_series: CountPoint[]
  recent: CommissionEvent[]
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
