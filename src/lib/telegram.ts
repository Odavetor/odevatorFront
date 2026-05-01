'use client'

import type { TelegramUser } from '@/types'

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string
        initDataUnsafe: {
          user?: TelegramUser
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

export function getUser(): TelegramUser | null {
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
  getWebApp()?.openLink(url)
}

export function getTimeGreeting(): string {
  const h = new Date().getHours()
  if (h < 6) return 'Доброй ночи'
  if (h < 12) return 'Доброе утро'
  if (h < 17) return 'Добрый день'
  return 'Добрый вечер'
}
