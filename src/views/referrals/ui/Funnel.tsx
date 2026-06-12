'use client'

import { motion } from 'framer-motion'
import { EASE_EDITORIAL } from '@shared/lib'
import { pct } from '../lib/format'

interface Props {
  clicks: number
  invited: number
  paid: number
}

interface Stage {
  label: string
  value: number
  color: string
}

export function Funnel({ clicks, invited, paid }: Props) {
  const top = Math.max(clicks, invited, paid, 1)
  const stages: Stage[] = [
    { label: 'Переходы', value: clicks, color: 'rgba(255,255,255,0.55)' },
    { label: 'Регистрации', value: invited, color: 'var(--rose)' },
    { label: 'Оплатили', value: paid, color: '#5FD296' },
  ]
  const regConv = pct(invited, clicks)
  const payConv = pct(paid, invited)

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-kicker">воронка</span>
        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {regConv}% переход→рег · {payConv}% рег→оплата
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {stages.map((s, i) => (
          <div key={s.label} className="flex items-center gap-3">
            <span
              className="w-[88px] flex-shrink-0 text-[12px]"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              {s.label}
            </span>
            <div
              className="relative h-7 flex-1 overflow-hidden rounded-lg"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max((s.value / top) * 100, s.value > 0 ? 9 : 0)}%` }}
                transition={{ duration: 0.7, delay: 0.08 * i, ease: EASE_EDITORIAL }}
                className="absolute inset-y-0 left-0 rounded-lg"
                style={{ background: s.color, opacity: 0.9 }}
              />
              <span
                className="absolute inset-y-0 right-2.5 flex items-center font-sans text-[12px] font-bold tabular-nums"
                style={{ color: 'var(--text)' }}
              >
                {s.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
