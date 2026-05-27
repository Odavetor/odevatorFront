'use client'

import { motion } from 'framer-motion'
import { haptic } from '@/lib/telegram'
import type { Tier } from '@features/buy-pack'

interface Props {
  tier: Tier
  onChange: (t: Tier) => void
  standardLabel: string
  promoLabel: string
}

export function TierSwitch({ tier, onChange, standardLabel, promoLabel }: Props) {
  return (
    <div
      className="flex p-1 rounded-full self-start"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      {(['standard', 'weekly_promo'] as const).map((t) => {
        const active = tier === t
        const isPromo = t === 'weekly_promo'
        const accent = isPromo ? 'var(--splash-cyan)' : 'var(--rose)'
        const accentBg = isPromo ? 'var(--splash-cyan-bg)' : 'rgba(224,63,106,0.16)'
        const accentBorder = isPromo
          ? 'rgba(63,212,224,0.32)'
          : 'var(--border-rose)'
        return (
          <button
            key={t}
            onClick={() => {
              haptic('light')
              onChange(t)
            }}
            className="relative px-4 py-1.5 rounded-full no-tap-highlight"
          >
            {active && (
              <motion.div
                layoutId="shop-tier-tab"
                className="absolute inset-0 rounded-full"
                style={{
                  background: accentBg,
                  border: `1px solid ${accentBorder}`,
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span
              className="relative z-10 font-sans"
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: active ? accent : 'rgba(255,255,255,0.5)',
              }}
            >
              {t === 'standard' ? standardLabel : promoLabel}
            </span>
          </button>
        )
      })}
    </div>
  )
}
