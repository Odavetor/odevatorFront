import type { LedgerEntry, MeResponse, PaymentTx, WalletResponse } from '@shared/api'

export interface MockUserData {
  user_id: number
  username: string | null
  balance: number
  active_processes: number
  generations: number
  reg_date: string
}

export interface MockHistoryItem {
  id: number
  user_id: number
  bot_token: string
  image_url: string
  local_path: string | null
  created_at: string
  expires_in_hours?: number
}

export const MOCK_ME: MeResponse = {
  id: 1,
  telegram_user_id: 999999,
  username: 'velvet_dev',
  first_name: 'Dev',
  last_name: '',
  language_code: 'ru',
  referral_code: 'DEV0001',
  referral_deep_link: 'https://t.me/velvet_ai_bot?startapp=DEV0001',
  lifetime_generations: 47,
  created_at: '2025-01-14T18:00:00Z',
  updated_at: '2025-01-14T18:00:00Z',
  is_admin: false,
}

export const MOCK_WALLET: WalletResponse = {
  balance_minor: 123400,
  referral_balance_minor: 0,
  prepaid_generations_remaining: 5,
  currency: 'RUB',
  updated_at: '2025-01-14T18:00:00Z',
}

export const MOCK_USER_DATA: MockUserData = {
  user_id: 999999,
  username: 'velvet_dev',
  balance: 1234,
  active_processes: 5,
  generations: 47,
  reg_date: '2025-01-14T18:00:00',
}

const PORTRAIT_SEEDS = [
  64, 177, 26, 338, 433, 453, 491, 519, 550, 572, 624, 669,
  700, 721, 759, 773, 819, 854, 883, 901,
]

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString()

export const MOCK_HISTORY: MockHistoryItem[] = PORTRAIT_SEEDS.map((seed, i) => ({
  id: i + 1,
  user_id: 999999,
  bot_token: 'mock',
  image_url: `https://picsum.photos/seed/${seed}/400/647`,
  local_path: null,
  created_at: hoursAgo(i * 5 + 1),
  expires_in_hours: Math.max(1, 72 - (i * 5 + 1)),
}))

export const MOCK_LEDGER: LedgerEntry[] = [
  { id: 220, delta_minor: -1, balance_after_minor: 5, wallet_bucket: 'prepaid_slots', kind: 'generation', ref_kind: 'job', ref_id: 4523, created_at: hoursAgo(2) },
  { id: 219, delta_minor: -1, balance_after_minor: 6, wallet_bucket: 'prepaid_slots', kind: 'generation', ref_kind: 'job', ref_id: 4517, created_at: hoursAgo(4) },
  { id: 218, delta_minor: 3, balance_after_minor: 7, wallet_bucket: 'prepaid_slots', kind: 'pack_purchase', ref_kind: 'payment', ref_id: 412, created_at: hoursAgo(12) },
  { id: 217, delta_minor: -1, balance_after_minor: 4, wallet_bucket: 'prepaid_slots', kind: 'generation', ref_kind: 'job', ref_id: 4502, created_at: hoursAgo(36) },
  { id: 216, delta_minor: 1, balance_after_minor: 5, wallet_bucket: 'prepaid_slots', kind: 'generation_refund', ref_kind: 'job', ref_id: 4491, created_at: hoursAgo(40) },
  { id: 215, delta_minor: -1, balance_after_minor: 4, wallet_bucket: 'prepaid_slots', kind: 'generation', ref_kind: 'job', ref_id: 4491, created_at: hoursAgo(42) },
  { id: 214, delta_minor: 5000, balance_after_minor: 12340, wallet_bucket: 'referral', kind: 'referral_credit', ref_kind: 'user', ref_id: 8821, created_at: hoursAgo(60) },
  { id: 213, delta_minor: 10, balance_after_minor: 5, wallet_bucket: 'prepaid_slots', kind: 'pack_purchase', ref_kind: 'payment', ref_id: 401, created_at: hoursAgo(96) },
  { id: 212, delta_minor: -1, balance_after_minor: -5, wallet_bucket: 'prepaid_slots', kind: 'generation', ref_kind: 'job', ref_id: 4400, created_at: hoursAgo(120) },
  { id: 211, delta_minor: 1, balance_after_minor: -4, wallet_bucket: 'prepaid_slots', kind: 'welcome_bonus', created_at: hoursAgo(168) },
]

export const MOCK_PAYMENTS: PaymentTx[] = [
  { id: 412, external_id: 'plt-9aef21', status: 'completed', amount_minor: 12900, currency: 'RUB', payment_method: 2, description: 'Пакет 3 фото', credited_wallet: true, created_at: hoursAgo(12), updated_at: hoursAgo(12) },
  { id: 411, external_id: 'plt-7c1820', status: 'failed', amount_minor: 4900, currency: 'RUB', payment_method: 13, description: 'Пакет 1 фото', credited_wallet: false, created_at: hoursAgo(48), updated_at: hoursAgo(48) },
  { id: 410, external_id: 'plt-66b193', status: 'pending', amount_minor: 12900, currency: 'RUB', payment_method: 2, description: 'Пакет 3 фото', credited_wallet: false, created_at: hoursAgo(50), updated_at: hoursAgo(50) },
  { id: 401, external_id: 'plt-3f0a8d', status: 'completed', amount_minor: 39900, currency: 'RUB', payment_method: 2, description: 'Пакет 10 фото', credited_wallet: true, created_at: hoursAgo(96), updated_at: hoursAgo(96) },
  { id: 380, external_id: 'plt-1d29ee', status: 'completed', amount_minor: 4900, currency: 'RUB', payment_method: 13, description: 'Пакет 1 фото', credited_wallet: true, created_at: hoursAgo(168), updated_at: hoursAgo(168) },
  { id: 360, external_id: 'plt-99ab14', status: 'refunded', amount_minor: 12900, currency: 'RUB', payment_method: 2, description: 'Пакет 3 фото', credited_wallet: false, created_at: hoursAgo(240), updated_at: hoursAgo(238) },
]
