'use client'

import { api } from '@shared/api'

export interface DayCount {
  day: string
  count: number
}

export interface LabelCount {
  label: string
  count: number
}

export interface Stats {
  generated_at: string
  range_days: number
  users: {
    total: number
    new_in_range: number
    blocked: number
    active_in_range: number
    from_referral: number
    from_traffic: number
    organic: number
    new_series: DayCount[]
  }
  funnel: {
    total: number
    ever_generated: number
    ever_completed: number
    ever_paid: number
  }
  generations: {
    total: number
    completed: number
    failed: number
    rejected: number
    in_range: number
    series: DayCount[]
    top_styles: LabelCount[]
  }
  monetization: {
    paying_users: number
    paid_orders: number
    repeat_buyers: number
    tokens_purchased: number
    tokens_consumed: number
    tokens_outstanding: number
    pack_mix: LabelCount[]
  }
  referral: {
    referred_users: number
    traffic_users: number
    payout_minor: number
    top_referrers: LabelCount[]
  }
}

export function fetchStats(rangeDays: number): Promise<Stats> {
  return api<Stats>(`/api/v1/admin/stats?range=${rangeDays}`)
}
