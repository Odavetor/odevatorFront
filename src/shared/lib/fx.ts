'use client'

import { useSyncExternalStore } from 'react'
import { currencyForLang, intlLocale } from './locale'

let rates: Record<string, number> = { RUB: 1 }
let loaded = false

const listeners = new Set<() => void>()
const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}
const notify = () => {
  for (const cb of listeners) cb()
}

let inFlight: Promise<void> | null = null
function load() {
  if (loaded || inFlight || typeof window === 'undefined') return
  inFlight = fetch('/api/fx', { cache: 'no-store' })
    .then(async (r) => {
      if (!r.ok) return
      const data = (await r.json()) as { rates?: Record<string, number> }
      if (data.rates) {
        rates = { RUB: 1, ...data.rates }
        loaded = true
        notify()
      }
    })
    .catch(() => {})
    .finally(() => {
      inFlight = null
    })
}

export function fxRate(currency: string): number {
  return rates[currency] ?? 0
}

export function useFx(): boolean {
  load()
  return useSyncExternalStore(
    subscribe,
    () => loaded,
    () => false,
  )
}

export function formatPrice(rubMinor: number): string {
  const cur = currencyForLang()
  const rubMajor = (rubMinor || 0) / 100
  let value = rubMajor
  if (cur !== 'RUB') {
    const rate = fxRate(cur)
    value = rate > 0 ? rubMajor / rate : rubMajor
  }
  const fractionDigits = cur === 'RUB' ? 0 : 2
  try {
    return new Intl.NumberFormat(intlLocale(), {
      style: 'currency',
      currency: cur,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value)
  } catch {
    return `${value.toFixed(fractionDigits)} ${cur}`
  }
}
