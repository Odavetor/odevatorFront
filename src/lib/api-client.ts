'use client'

import { getInitData } from './telegram'

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '')

let tokenPromise: Promise<string | null> | null = null
let cachedToken: string | null = null

async function fetchToken(): Promise<string | null> {
  if (!BASE_URL) return null
  const initData = getInitData()
  if (!initData) return null
  try {
    const r = await fetch(`${BASE_URL}/api/v1/auth/telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ init_data: initData }),
    })
    if (!r.ok) return null
    const j = (await r.json()) as { access_token?: string }
    return j.access_token ?? null
  } catch {
    return null
  }
}

export async function getAuthToken(): Promise<string | null> {
  if (cachedToken) return cachedToken
  if (!tokenPromise) {
    tokenPromise = fetchToken().then((t) => {
      cachedToken = t
      return t
    })
  }
  return tokenPromise
}

export function clearAuthToken() {
  cachedToken = null
  tokenPromise = null
}

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(status: number, message: string, body: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

async function parseError(r: Response): Promise<ApiError> {
  let body: unknown = null
  let message = `HTTP ${r.status}`
  try {
    body = await r.json()
    if (body && typeof body === 'object' && 'error' in body && typeof (body as Record<string, unknown>).error === 'string') {
      message = (body as { error: string }).error
    }
  } catch {
    try {
      message = (await r.text()) || message
    } catch {}
  }
  return new ApiError(r.status, message, body)
}

export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAuthToken()
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  const r = await fetch(`${BASE_URL}${path}`, { ...init, headers })
  if (r.status === 401) {
    clearAuthToken()
    const retryToken = await getAuthToken()
    if (retryToken) {
      headers.set('Authorization', `Bearer ${retryToken}`)
      const r2 = await fetch(`${BASE_URL}${path}`, { ...init, headers })
      if (!r2.ok) throw await parseError(r2)
      return r2.json() as Promise<T>
    }
  }
  if (!r.ok) throw await parseError(r)
  if (r.status === 204) return undefined as T
  return r.json() as Promise<T>
}

export async function apiUpload<T = unknown>(path: string, fd: FormData): Promise<T> {
  const token = await getAuthToken()
  const headers = new Headers()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const r = await fetch(`${BASE_URL}${path}`, { method: 'POST', headers, body: fd })
  if (!r.ok) throw await parseError(r)
  return r.json() as Promise<T>
}
