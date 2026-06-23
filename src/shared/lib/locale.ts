import { useSyncExternalStore } from 'react'

export type Lang = 'ru' | 'en' | 'de'

export const SUPPORTED_LANGS: Lang[] = ['ru', 'en', 'de']

const DEFAULT_LANG: Lang = 'ru'

// Single source of truth for the active UI language. Set once after the Telegram
// user loads (see TelegramProvider) — kept hydration-safe by defaulting to RU on
// both server and first client render, then switching post-mount.
let current: Lang = DEFAULT_LANG

const listeners = new Set<() => void>()

export function normalizeLang(code?: string | null): Lang {
  const c = (code || '').toLowerCase()
  if (c.startsWith('en')) return 'en'
  if (c.startsWith('de')) return 'de'
  if (c.startsWith('ru')) return 'ru'
  return DEFAULT_LANG
}

export function getLang(): Lang {
  return current
}

export function setLang(code?: string | null): void {
  const next = normalizeLang(code)
  if (next === current) return
  current = next
  for (const cb of listeners) cb()
}

const LANG_STORAGE_KEY = 'odevator_lang'

export function storedLang(): Lang | null {
  if (typeof window === 'undefined') return null
  try {
    const v = window.localStorage.getItem(LANG_STORAGE_KEY)
    return v === 'ru' || v === 'en' || v === 'de' ? v : null
  } catch {
    return null
  }
}

export function setLangPersisted(lang: Lang): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang)
    } catch {}
  }
  setLang(lang)
}

export function subscribeLang(cb: () => void): () => void {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

// tt resolves a {ru, en, de} map to the active language. Use for non-CMS strings
// (relative dates, status labels, plurals) that live in component/code, not the CMS.
export function tt(m: Record<Lang, string>): string {
  return m[current] ?? m.ru
}

// pickLabel chooses a per-language catalog label, falling back to the RU base label.
export function pickLabel(label: string, labelEn?: string | null, labelDe?: string | null): string {
  if (current === 'en') return labelEn || label
  if (current === 'de') return labelDe || label
  return label
}

const INTL_LOCALE: Record<Lang, string> = { ru: 'ru-RU', en: 'en', de: 'de-DE' }

export function intlLocale(): string {
  return INTL_LOCALE[current]
}

const LANG_CURRENCY: Record<Lang, string> = { ru: 'RUB', en: 'USD', de: 'EUR' }

export function currencyForLang(l: Lang = current): string {
  return LANG_CURRENCY[l]
}

// useLang re-renders a component when the active language changes.
export function useLang(): Lang {
  return useSyncExternalStore(subscribeLang, getLang, () => DEFAULT_LANG)
}
