'use client'

import { useSyncExternalStore } from 'react'
import { getAuthToken } from '../api-client'
import { DEFAULT_STRINGS, type ContentPayload, type FaqItem } from './keys'

interface ContentState {
  strings: Record<string, string>
  faq: FaqItem[]
  loadedAt: number
}

let state: ContentState = {
  strings: { ...DEFAULT_STRINGS },
  faq: [],
  loadedAt: 0,
}

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

export function refreshContent(): Promise<void> {
  if (inFlight) return inFlight
  inFlight = fetch('/api/content', { cache: 'no-store' })
    .then(async (r) => {
      if (!r.ok) return
      const data = (await r.json()) as ContentPayload
      state = {
        strings: { ...DEFAULT_STRINGS, ...(data.strings ?? {}) },
        faq: Array.isArray(data.faq) ? [...data.faq].sort((a, b) => a.sort_order - b.sort_order) : [],
        loadedAt: Date.now(),
      }
      notify()
    })
    .catch(() => {})
    .finally(() => {
      inFlight = null
    })
  return inFlight
}

let bootstrapped = false
function bootstrap() {
  if (bootstrapped || typeof window === 'undefined') return
  bootstrapped = true
  refreshContent()
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshContent()
  })
}

// ===== Хуки =====

const getStringSnapshot = (key: string, fallback?: string): string =>
  state.strings[key] ?? fallback ?? DEFAULT_STRINGS[key] ?? ''

export function useContent(key: string, fallback?: string): string {
  bootstrap()
  return useSyncExternalStore(
    subscribe,
    () => getStringSnapshot(key, fallback),
    () => fallback ?? DEFAULT_STRINGS[key] ?? '',
  )
}

const getFaqSnapshot = (): FaqItem[] => state.faq
const FAQ_EMPTY: FaqItem[] = []

export function useFaq(): FaqItem[] {
  bootstrap()
  return useSyncExternalStore(subscribe, getFaqSnapshot, () => FAQ_EMPTY)
}

// ===== Админские операции (через Next route handlers, чтобы дернуть revalidateTag) =====

async function adminFetch(path: string, init: RequestInit = {}) {
  const token = await getAuthToken()
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  const r = await fetch(path, { ...init, headers })
  if (!r.ok) {
    let msg = `HTTP ${r.status}`
    try {
      const j = await r.json()
      if (j?.error) msg = j.error
    } catch {}
    throw new Error(msg)
  }
  return r.status === 204 ? null : r.json()
}

export async function updateString(key: string, value: string) {
  const data = await adminFetch(`/api/admin/content/strings/${encodeURIComponent(key)}`, {
    method: 'PATCH',
    body: JSON.stringify({ value }),
  })
  await refreshContent()
  return data
}

export async function createFaq(payload: { question: string; answer: string; sort_order?: number }) {
  const data = await adminFetch('/api/admin/content/faq', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  await refreshContent()
  return data as FaqItem
}

export async function updateFaq(
  id: number,
  payload: Partial<{ question: string; answer: string; sort_order: number }>,
) {
  const data = await adminFetch(`/api/admin/content/faq/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  await refreshContent()
  return data as FaqItem
}

export async function deleteFaq(id: number) {
  await adminFetch(`/api/admin/content/faq/${id}`, { method: 'DELETE' })
  await refreshContent()
}
