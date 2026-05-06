// Mock-данные для dev-режима. Доступны только когда NEXT_PUBLIC_USE_MOCK=true
// и NODE_ENV !== 'production' (см. lib/dev.ts::isMockEnabled).
//
// Раньше эти данные жили в lib/mock.ts и отдавались Next-роутами /api/balance, /api/history.
// Теперь — чистый клиентский фолбэк, без HTTP-хопа.

import type { HistoryItem, UserData } from '@/types'
import type { MeResponse, WalletResponse } from './api/types'

export const MOCK_ME: MeResponse = {
  id: 1,
  telegram_user_id: 999999,
  username: 'velvet_dev',
  first_name: 'Dev',
  last_name: '',
  language_code: 'ru',
  referral_code: 'DEV0001',
  created_at: '2025-01-14T18:00:00Z',
  updated_at: '2025-01-14T18:00:00Z',
  is_admin: false,
}

export const MOCK_WALLET: WalletResponse = {
  balance_minor: 123400, // 1 234 ₽
  referral_balance_minor: 0,
  prepaid_generations_remaining: 5,
  currency: 'RUB',
  updated_at: '2025-01-14T18:00:00Z',
}

export const MOCK_USER_DATA: UserData = {
  user_id: 999999,
  username: 'velvet_dev',
  balance: 1234,
  active_processes: 5,
  generations: 47,
  reg_date: '2025-01-14T18:00:00',
}

// Picsum-портреты для фейковой истории
const PORTRAIT_SEEDS = [
  64, 177, 26, 338, 433, 453, 491, 519, 550, 572, 624, 669,
  700, 721, 759, 773, 819, 854, 883, 901,
]

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString()

export const MOCK_HISTORY: HistoryItem[] = PORTRAIT_SEEDS.map((seed, i) => ({
  id: i + 1,
  user_id: 999999,
  bot_token: 'mock',
  image_url: `https://picsum.photos/seed/${seed}/400/647`,
  local_path: null,
  created_at: hoursAgo(i * 5 + 1),
  expires_in_hours: Math.max(1, 72 - (i * 5 + 1)),
}))
