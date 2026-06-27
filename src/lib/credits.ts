'use client'

import { api } from '@shared/api'

export interface CreditResult {
  found: boolean
  user_id?: number
  username?: string
  total_credits: number
}

export function lookupCredits(telegramId: string): Promise<CreditResult> {
  return api<CreditResult>(`/api/v1/admin/credits?telegram_user_id=${encodeURIComponent(telegramId)}`)
}

export function grantCredits(telegramId: string, amount: number): Promise<CreditResult> {
  return api<CreditResult>('/api/v1/admin/credits/grant', {
    method: 'POST',
    body: JSON.stringify({ telegram_user_id: telegramId, amount }),
  })
}
