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

export interface MoneyDay {
  day: string
  minor: number
}

export interface Stats {
  generated_at: string
  range_days: number
  users: {
    total: number
    new_in_range: number
    new_prev_range: number
    blocked: number
    active_in_range: number
    from_referral: number
    from_traffic: number
    organic: number
    new_series: DayCount[]
    active_series: DayCount[]
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
    prev_range: number
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
  revenue: {
    total_minor: number
    in_range_minor: number
    prev_range_minor: number
    refunded_minor: number
    aov_minor: number
    arppu_minor: number
    orders_created: number
    orders_paid: number
    payers_in_range: number
    payers_prev_range: number
    series: MoneyDay[]
    top_spenders: LabelCount[]
  }
  operations: {
    jobs_in_flight: number
    failed_in_range: number
    pending_withdrawals: number
    pending_withdrawal_minor: number
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
