export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

// Aggregated view-model собранный из MeResponse + WalletResponse в TelegramProvider.
// Сам бэк возвращает их как два отдельных DTO (см. src/lib/api/types.ts).
export interface UserData {
  user_id: number
  username: string | null
  balance: number
  active_processes: number
  generations: number
  reg_date: string
}

export interface HistoryItem {
  id: number
  user_id: number
  bot_token: string
  image_url: string
  local_path: string | null
  created_at: string
  expires_in_hours?: number
}

export type GenerationPhase = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

export interface GenerationState {
  phase: GenerationPhase
  progress: number
  resultUrl?: string
  error?: string
}
