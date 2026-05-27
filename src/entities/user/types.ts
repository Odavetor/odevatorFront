import type { TelegramUserLike } from '@shared/lib'

export type TelegramUser = TelegramUserLike

export interface UserData {
  user_id: number
  username: string | null
  balance: number
  active_processes: number
  generations: number
  reg_date: string
}
