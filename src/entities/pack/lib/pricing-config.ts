'use client'

import { api } from '@shared/api'

export interface PricingConfigItem {
  key: string
  value_minor: number
  updated_at?: string
}

interface BackPricingResponse {
  items: PricingConfigItem[]
}

export async function fetchPricingConfig(): Promise<PricingConfigItem[]> {
  const r = await api<BackPricingResponse | PricingConfigItem[]>('/api/v1/admin/pricing')
  if (Array.isArray(r)) return r
  return r.items ?? []
}

export function updatePricingConfig(key: string, value_minor: number): Promise<{ status: string }> {
  return api<{ status: string }>(`/api/v1/admin/pricing/${encodeURIComponent(key)}`, {
    method: 'PATCH',
    body: JSON.stringify({ value_minor }),
  })
}

export interface PackPricingItem {
  tier: string
  quantity: number
  price_minor: number
  is_active: boolean
}

interface BackPackPricingResponse {
  items: PackPricingItem[]
}

export async function fetchPackPricing(): Promise<PackPricingItem[]> {
  const r = await api<BackPackPricingResponse | PackPricingItem[]>('/api/v1/admin/payments/packs')
  if (Array.isArray(r)) return r
  return r.items ?? []
}

export function updatePackPricing(
  tier: string,
  quantity: number,
  payload: { price_minor?: number; is_active?: boolean },
): Promise<{ status: string }> {
  return api<{ status: string }>(
    `/api/v1/admin/payments/packs/${encodeURIComponent(tier)}/${quantity}`,
    { method: 'PATCH', body: JSON.stringify(payload) },
  )
}

export interface FxRateItem {
  currency: string
  rub_per_unit: number
  manual: boolean
  updated_at?: string
}

export async function fetchFxRates(): Promise<FxRateItem[]> {
  const r = await api<{ rates: FxRateItem[] } | FxRateItem[]>('/api/v1/admin/fx-rates')
  if (Array.isArray(r)) return r
  return r.rates ?? []
}

export function updateFxRate(currency: string, rubPerUnit: number): Promise<{ status: string }> {
  return api<{ status: string }>(`/api/v1/admin/fx-rates/${encodeURIComponent(currency)}`, {
    method: 'PATCH',
    body: JSON.stringify({ rub_per_unit: rubPerUnit }),
  })
}
