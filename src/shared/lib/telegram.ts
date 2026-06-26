'use client'

import { tt } from './locale'

export interface TelegramUserLike {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string
        initDataUnsafe: {
          user?: TelegramUserLike
          auth_date?: number
          hash?: string
        }
        version: string
        platform: string
        colorScheme: 'light' | 'dark'
        isExpanded: boolean
        viewportHeight: number
        viewportStableHeight: number
        MainButton: {
          text: string
          isVisible: boolean
          setText(text: string): void
          show(): void
          hide(): void
          onClick(cb: () => void): void
          offClick(cb: () => void): void
        }
        BackButton: {
          isVisible: boolean
          show(): void
          hide(): void
          onClick(cb: () => void): void
          offClick(cb: () => void): void
        }
        HapticFeedback: {
          impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
          notificationOccurred(type: 'error' | 'success' | 'warning'): void
          selectionChanged(): void
        }
        close(): void
        expand(): void
        ready(): void
        openLink(url: string): void
        openTelegramLink(url: string): void
        openInvoice(
          url: string,
          cb?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void,
        ): void
        showAlert(message: string, cb?: () => void): void
        showConfirm(message: string, cb: (ok: boolean) => void): void
      }
    }
  }
}

export function getWebApp() {
  if (typeof window !== 'undefined') return window.Telegram?.WebApp ?? null
  return null
}

export function getUser(): TelegramUserLike | null {
  return getWebApp()?.initDataUnsafe?.user ?? null
}

export function getInitData(): string {
  return getWebApp()?.initData ?? ''
}

export function haptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  getWebApp()?.HapticFeedback.impactOccurred(style)
}

export function hapticNotify(type: 'success' | 'warning' | 'error') {
  getWebApp()?.HapticFeedback.notificationOccurred(type)
}

export function hapticSelect() {
  getWebApp()?.HapticFeedback.selectionChanged()
}

export function expand() {
  getWebApp()?.expand()
}

export function ready() {
  getWebApp()?.ready()
}

export function openLink(url: string) {
  try {
    const { protocol } = new URL(url)
    if (protocol !== 'https:' && protocol !== 'http:') return
  } catch {
    return
  }
  getWebApp()?.openLink(url)
}

export function openInvoice(
  url: string,
  cb?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void,
) {
  getWebApp()?.openInvoice(url, cb)
}

export function getTimeGreeting(): string {
  const h = new Date().getHours()
  if (h < 6) return tt({ ru: 'Доброй ночи', en: 'Good night', de: 'Gute Nacht' })
  if (h < 12) return tt({ ru: 'Доброе утро', en: 'Good morning', de: 'Guten Morgen' })
  if (h < 17) return tt({ ru: 'Добрый день', en: 'Good afternoon', de: 'Guten Tag' })
  return tt({ ru: 'Добрый вечер', en: 'Good evening', de: 'Guten Abend' })
}
