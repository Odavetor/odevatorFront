'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { EASE_EDITORIAL, haptic } from '@shared/lib'
import { fmtRub } from '@entities/pack'
import type { EarningsPoint } from '@/lib/referral'
import { dailyBuckets, dayLabel } from '../lib/series'

interface Props {
  series: EarningsPoint[]
  days: number
}

export function EarningsBars({ series, days }: Props) {
  const [active, setActive] = useState<number | null>(null)
  const buckets = useMemo(() => {
    const byDate = new Map(series.map((p) => [p.date, p.amount_minor]))
    return dailyBuckets(days, (k) => byDate.get(k) ?? 0)
  }, [series, days])

  const max = Math.max(1, ...buckets)
  const total = buckets.reduce((a, b) => a + b, 0)
  const peakIdx = buckets.indexOf(Math.max(...buckets))
  const shown = active ?? peakIdx
  const hasData = total > 0

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-kicker">динамика заработка</span>
          <span className="font-sans text-[20px] font-extrabold tabular-nums" style={{ color: 'var(--text)' }}>
            {fmtRub(total)} ₽
          </span>
        </div>
        {hasData && (
          <div className="flex flex-col items-end">
            <span className="font-sans text-[14px] font-bold tabular-nums" style={{ color: 'var(--rose)' }}>
              {fmtRub(buckets[shown])} ₽
            </span>
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {dayLabel(shown, buckets.length)}
            </span>
          </div>
        )}
      </div>

      {hasData ? (
        <div className="flex h-[88px] items-end gap-[3px]">
          {buckets.map((v, i) => {
            const isActive = i === shown
            return (
              <button
                key={i}
                onClick={() => {
                  haptic('light')
                  setActive(i)
                }}
                className="no-tap-highlight group flex h-full flex-1 items-end"
                style={{ minWidth: 2 }}
              >
                <motion.span
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max((v / max) * 100, v > 0 ? 4 : 1.5)}%` }}
                  transition={{ duration: 0.6, delay: Math.min(i * 0.012, 0.25), ease: EASE_EDITORIAL }}
                  className="w-full rounded-t-[3px]"
                  style={{
                    background: isActive
                      ? 'linear-gradient(180deg, var(--rose) 0%, var(--rose-deep) 100%)'
                      : v > 0
                        ? 'rgba(224,140,170,0.45)'
                        : 'rgba(255,255,255,0.08)',
                  }}
                />
              </button>
            )
          })}
        </div>
      ) : (
        <div
          className="flex items-center justify-center rounded-xl text-[11px]"
          style={{ height: 88, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.03)' }}
        >
          пока нет начислений за период
        </div>
      )}
    </section>
  )
}
