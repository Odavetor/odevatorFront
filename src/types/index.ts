export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

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

export interface Package {
  id: string
  count: number
  price: number
  label: string
  popular?: boolean
  savingsLabel?: string
}

export type PaymentMethod = 'cryptobot' | 'platega_sbp' | 'platega_crypto' | 'rollypay'

export interface PaymentIntent {
  method: PaymentMethod
  amount: number
  invoiceUrl: string
  invoiceId: string
}

export type GenerationPhase = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

export interface GenerationState {
  phase: GenerationPhase
  progress: number
  resultUrl?: string
  error?: string
}
