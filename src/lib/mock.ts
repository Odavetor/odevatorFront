import type { UserData, HistoryItem } from '@/types'

export const MOCK_USER: UserData = {
  user_id: 999999,
  username: 'velvet_user',
  balance: 1234,
  active_processes: 5,
  generations: 47,
  reg_date: '2025-01-14T18:00:00',
}

// Golden ratio portrait 400×647
// Picsum seeds выбраны так чтобы давать портреты людей
const PORTRAIT_SEEDS = [
  64, 177, 26, 338, 433, 453, 491, 519, 550, 572, 624, 669,
  700, 721, 759, 773, 819, 854, 883, 901,
]

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3_600_000).toISOString()
}

export const MOCK_HISTORY: HistoryItem[] = PORTRAIT_SEEDS.map((seed, i) => ({
  id: i + 1,
  user_id: 999999,
  bot_token: 'mock',
  image_url: `https://picsum.photos/seed/${seed}/400/647`,
  local_path: null,
  created_at: hoursAgo(i * 5 + 1),
  expires_in_hours: Math.max(1, 72 - (i * 5 + 1)),
}))
