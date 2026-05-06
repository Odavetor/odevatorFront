'use client'

// В Next.js process.env.NODE_ENV статически инлайнится в бандл,
// поэтому в проде эта ветка вырезается tree-shaker'ом.
export const IS_DEV = process.env.NODE_ENV !== 'production'

const ADMIN_OVERRIDE_KEY = 'velvet:dev:admin'
const VIEW_AS_KEY = 'velvet:dev:viewAs' // 'admin' | 'user' | null

export function isMockEnabled(): boolean {
  if (!IS_DEV) return false
  return process.env.NEXT_PUBLIC_USE_MOCK === 'true'
}

export type DevViewAs = 'admin' | 'user' | null

export function getDevViewAs(): DevViewAs {
  if (!IS_DEV) return null
  if (typeof window === 'undefined') return null
  const v = window.localStorage.getItem(VIEW_AS_KEY)
  if (v === 'admin' || v === 'user') return v
  // обратная совместимость со старым ключом
  const legacy = window.localStorage.getItem(ADMIN_OVERRIDE_KEY)
  if (legacy === 'true') return 'admin'
  return null
}

export function setDevViewAs(value: DevViewAs) {
  if (!IS_DEV || typeof window === 'undefined') return
  if (value === null) window.localStorage.removeItem(VIEW_AS_KEY)
  else window.localStorage.setItem(VIEW_AS_KEY, value)
  window.localStorage.removeItem(ADMIN_OVERRIDE_KEY)
  window.dispatchEvent(new CustomEvent('velvet:dev:viewAsChanged', { detail: value }))
}
