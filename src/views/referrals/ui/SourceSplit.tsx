'use client'

import { motion } from 'framer-motion'
import { EASE_EDITORIAL, tt, useLang } from '@shared/lib'
import { fmtRub } from '@entities/pack'
import { pct } from '../lib/format'

interface Props {
  purchaseMinor: number
  genMinor: number
}

const PURCHASE_COLOR = 'var(--rose)'
const GEN_COLOR = '#7AA2F7'

export function SourceSplit({ purchaseMinor, genMinor }: Props) {
  useLang()
  const total = purchaseMinor + genMinor
  if (total <= 0) return null

  const pPct = pct(purchaseMinor, total)
  const gPct = 100 - pPct

  return (
    <section className="flex flex-col gap-2.5">
      <span className="text-kicker">
        {tt({ ru: 'источники дохода', en: 'income sources', de: 'Einnahmequellen' })}
      </span>
      <div
        className="flex h-3 overflow-hidden rounded-full"
        style={{ background: 'rgba(0,0,0,0.3)' }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pPct}%` }}
          transition={{ duration: 0.7, ease: EASE_EDITORIAL }}
          style={{ background: PURCHASE_COLOR }}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${gPct}%` }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE_EDITORIAL }}
          style={{ background: GEN_COLOR }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Legend
          color={PURCHASE_COLOR}
          label={tt({ ru: 'Пополнения', en: 'Top-ups', de: 'Aufladungen' })}
          amount={purchaseMinor}
          percent={pPct}
        />
        <Legend
          color={GEN_COLOR}
          label={tt({ ru: 'Генерации', en: 'Generations', de: 'Generierungen' })}
          amount={genMinor}
          percent={gPct}
        />
      </div>
    </section>
  )
}

function Legend({
  color,
  label,
  amount,
  percent,
}: {
  color: string
  label: string
  amount: number
  percent: number
}) {
  return (
    <div
      className="flex flex-col gap-0.5 rounded-xl px-3 py-2.5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {label} · {percent}%
        </span>
      </div>
      <span
        className="font-sans tabular-nums"
        style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}
      >
        {fmtRub(amount)} ₽
      </span>
    </div>
  )
}
