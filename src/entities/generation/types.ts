export type GenerationPhase = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

export interface GenerationState {
  phase: GenerationPhase
  progress: number
  resultUrl?: string
  error?: string
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
