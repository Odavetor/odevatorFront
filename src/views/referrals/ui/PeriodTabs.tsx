'use client'

import { motion } from 'framer-motion'
import { haptic } from '@shared/lib'

export type Period = 'today' | '7d' | '30d' | 'all'

const TABS: { key: Period; label: string }[] = [
  { key: 'today', label: 'Сегодня' },
  { key: '7d', label: '7 дней' },
  { key: '30d', label: '30 дней' },
  { key: 'all', label: 'Всё' },
]

interface Props {
  value: Period
  onChange: (p: Period) => void
}

export function PeriodTabs({ value, onChange }: Props) {
  return (
    <div
      className="flex gap-1 rounded-xl p-1"
      style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {TABS.map((t) => {
        const active = t.key === value
        return (
          <button
            key={t.key}
            onClick={() => {
              if (!active) {
                haptic('light')
                onChange(t.key)
              }
            }}
            className="no-tap-highlight relative flex-1 rounded-lg py-1.5 text-[12px] font-medium"
            style={{ color: active ? 'var(--text)' : 'rgba(255,255,255,0.45)' }}
          >
            {active && (
              <motion.span
                layoutId="period-pill"
                className="absolute inset-0 rounded-lg"
                style={{ background: 'var(--rose-dim)', border: '1px solid var(--border-rose)' }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative">{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}
