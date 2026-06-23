'use client'

import { motion } from 'framer-motion'
import { Coins, Sparkle } from '@phosphor-icons/react'
import { EASE_EDITORIAL, tt, useLang } from '@shared/lib'
import { fmtRub } from '@entities/pack'
import type { CommissionEvent } from '@/lib/referral'
import { relativeTime } from '../lib/format'

const SOURCE = {
  purchase: {
    label: () => tt({ ru: 'покупка пакета', en: 'pack purchase', de: 'Paketkauf' }),
    Icon: Coins,
  },
  generation: {
    label: () => tt({ ru: 'генерация', en: 'generation', de: 'Generierung' }),
    Icon: Sparkle,
  },
} as const

export function CommissionFeed({ events }: { events: CommissionEvent[] }) {
  useLang()
  if (events.length === 0) return null

  return (
    <section className="flex flex-col gap-2.5">
      <span className="text-kicker">
        {tt({ ru: 'последние начисления', en: 'recent earnings', de: 'letzte Gutschriften' })}
      </span>
      <div className="flex flex-col gap-1.5">
        {events.map((e, i) => {
          const meta = SOURCE[e.source] ?? SOURCE.purchase
          return (
            <motion.div
              key={`${e.created_at}-${i}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3), ease: EASE_EDITORIAL }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ background: 'var(--rose-dim)' }}
              >
                <meta.Icon size={15} color="var(--rose)" weight="fill" />
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {meta.label()}
                </span>
                <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  {relativeTime(e.created_at)}
                </span>
              </div>
              <span
                className="font-sans text-[15px] font-bold tabular-nums"
                style={{ color: '#5FD296' }}
              >
                +{fmtRub(e.amount_minor)} ₽
              </span>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
