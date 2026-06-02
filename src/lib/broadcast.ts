'use client'

import { api } from '@shared/api'

export type BroadcastStatus = 'queued' | 'sending' | 'done' | 'failed' | 'canceled'

export interface BroadcastButton {
  text: string
  url: string
}

export interface Broadcast {
  id: number
  text: string
  parse_mode: string
  media_type: string
  media_url: string
  buttons: BroadcastButton[][]
  status: BroadcastStatus
  total_recipients: number
  sent_count: number
  failed_count: number
  blocked_count: number
  error: string
  created_at: string
  started_at?: string
  finished_at?: string
}

export interface CreateBroadcastPayload {
  text: string
  parse_mode: '' | 'HTML'
  media_type: '' | 'photo' | 'video'
  media_url: string
  buttons: BroadcastButton[][]
}

interface BroadcastListResponse {
  items: Broadcast[]
}

export function createBroadcast(payload: CreateBroadcastPayload): Promise<Broadcast> {
  return api<Broadcast>('/api/v1/admin/broadcasts', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function sendTestBroadcast(payload: CreateBroadcastPayload): Promise<{ status: string }> {
  return api<{ status: string }>('/api/v1/admin/broadcasts/test', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function listBroadcasts(): Promise<Broadcast[]> {
  const r = await api<BroadcastListResponse>('/api/v1/admin/broadcasts?limit=20')
  return r.items ?? []
}
