'use client'

import { motion } from 'framer-motion'
import { haptic, tt, useLang } from '@shared/lib'

export type Period = 'today' | '7d' | '30d' | 'all'

const TABS: { key: Period; label: () => string }[] = [
  { key: 'today', label: () => tt({ ru: 'Сегодня', en: 'Today', de: 'Heute' }) },
  { key: '7d', label: () => tt({ ru: '7 дней', en: '7 days', de: '7 Tage' }) },
  { key: '30d', label: () => tt({ ru: '30 дней', en: '30 days', de: '30 Tage' }) },
  { key: 'all', label: () => tt({ ru: 'Всё', en: 'All', de: 'Alle' }) },
]

interface Props {
  value: Period
  onChange: (p: Period) => void
}

export function PeriodTabs({ value, onChange }: Props) {
  useLang()
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
            <span className="relative">{t.label()}</span>
          </button>
        )
      })}
    </div>
  )
}
