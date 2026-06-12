'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { EASE_EDITORIAL } from '@shared/lib'
import type { CountPoint } from '@/lib/referral'
import { dailyBuckets } from '../lib/series'

const DAYS = 30

export function SignupsBars({ series }: { series: CountPoint[] }) {
  const buckets = useMemo(() => {
    const byDate = new Map(series.map((p) => [p.date, p.count]))
    return dailyBuckets(DAYS, (k) => byDate.get(k) ?? 0)
  }, [series])

  const max = Math.max(1, ...buckets)
  const total = buckets.reduce((a, b) => a + b, 0)

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-end justify-between">
        <span className="text-kicker">приток рефералов · 30 дней</span>
        <span className="font-sans text-[14px] font-bold tabular-nums" style={{ color: 'var(--text)' }}>
          +{total}
        </span>
      </div>
      <div className="flex h-[44px] items-end gap-[3px]">
        {buckets.map((v, i) => (
          <motion.span
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${Math.max((v / max) * 100, v > 0 ? 8 : 1.5)}%` }}
            transition={{ duration: 0.5, delay: Math.min(i * 0.012, 0.25), ease: EASE_EDITORIAL }}
            className="flex-1 rounded-t-[3px]"
            style={{
              minWidth: 2,
              background: v > 0 ? 'rgba(95,210,150,0.65)' : 'rgba(255,255,255,0.07)',
            }}
          />
        ))}
      </div>
    </section>
  )
}
