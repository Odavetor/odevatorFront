'use client'

import { api } from '@shared/api'

export interface CampaignStats {
  users: number
  generated: number
  payers: number
  paid_orders: number
  revenue_minor: number
}

export interface Campaign {
  id: number
  code: string
  name: string
  deep_link: string
  archived: boolean
  created_at: string
  stats: CampaignStats
}

export interface CampaignDayCount {
  day: string
  count: number
}

export interface CampaignMoneyDay {
  day: string
  minor: number
}

export interface CampaignAnalytics {
  campaign: Campaign
  range_days: number
  funnel: {
    users: number
    ever_generated: number
    ever_completed: number
    ever_paid: number
  }
  users_in_range: number
  revenue_in_range_minor: number
  signup_series: CampaignDayCount[]
  revenue_series: CampaignMoneyDay[]
}

interface CampaignListResponse {
  items: Campaign[]
}

export async function listCampaigns(includeArchived: boolean): Promise<Campaign[]> {
  const r = await api<CampaignListResponse>(
    `/api/v1/admin/campaigns${includeArchived ? '?archived=1' : ''}`,
  )
  return r.items ?? []
}

export function createCampaign(name: string): Promise<Campaign> {
  return api<Campaign>('/api/v1/admin/campaigns', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export function fetchCampaignAnalytics(id: number, rangeDays: number): Promise<CampaignAnalytics> {
  return api<CampaignAnalytics>(`/api/v1/admin/campaigns/${id}?range=${rangeDays}`)
}

export function archiveCampaign(id: number): Promise<{ ok: boolean }> {
  return api<{ ok: boolean }>(`/api/v1/admin/campaigns/${id}/archive`, { method: 'POST' })
}

export function restoreCampaign(id: number): Promise<{ ok: boolean }> {
  return api<{ ok: boolean }>(`/api/v1/admin/campaigns/${id}/restore`, { method: 'POST' })
}
