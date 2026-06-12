'use client'

import { useId, useMemo } from 'react'
import type { EarningsPoint } from '@/lib/referral'

interface Props {
  series: EarningsPoint[]
  days: number
}

function buildBuckets(series: EarningsPoint[], days: number): number[] {
  const byDate = new Map(series.map((p) => [p.date, p.amount_minor]))
  const out: number[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    out.push(byDate.get(key) ?? 0)
  }
  return out
}

export function EarningsSparkline({ series, days }: Props) {
  const gradId = useId()
  const buckets = useMemo(() => buildBuckets(series, days), [series, days])
  const hasData = buckets.some((v) => v > 0)

  const w = 100
  const h = 34
  const max = Math.max(1, ...buckets)
  const step = buckets.length > 1 ? w / (buckets.length - 1) : w
  const line = buckets
    .map((v, i) => `${(i * step).toFixed(2)},${(h - (v / max) * (h - 3) - 1.5).toFixed(2)}`)
    .join(' ')
  const area = `0,${h} ${line} ${w},${h}`

  if (!hasData) {
    return (
      <div
        className="flex items-center justify-center rounded-xl text-[11px]"
        style={{ height: 56, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.03)' }}
      >
        пока нет начислений за период
      </div>
    )
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: 56 }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--rose)" stopOpacity={0.32} />
          <stop offset="100%" stopColor="var(--rose)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradId})`} />
      <polyline
        points={line}
        fill="none"
        stroke="var(--rose)"
        strokeWidth={1.75}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
