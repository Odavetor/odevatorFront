import { NextRequest } from 'next/server'

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '')

export type AdminCheck = { ok: true; auth: string } | { ok: false; status: number; error: string }

export async function verifyAdmin(req: NextRequest): Promise<AdminCheck> {
  if (!BASE_URL) return { ok: false, status: 503, error: 'NEXT_PUBLIC_API_BASE_URL is not set' }
  const auth = req.headers.get('authorization') ?? ''
  if (!auth) return { ok: false, status: 401, error: 'Unauthorized' }
  try {
    const r = await fetch(`${BASE_URL}/api/v1/users/me`, {
      headers: { Authorization: auth },
      cache: 'no-store',
    })
    if (!r.ok) return { ok: false, status: 401, error: 'Unauthorized' }
    const me = (await r.json()) as { is_admin?: boolean }
    if (!me?.is_admin) return { ok: false, status: 403, error: 'Forbidden' }
    return { ok: true, auth }
  } catch {
    return { ok: false, status: 502, error: 'Auth verification failed' }
  }
}
