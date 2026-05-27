'use client'

import { motion } from 'framer-motion'
import { Check, Lightning } from '@phosphor-icons/react'
import { SparkleBurst } from '@shared/ui'
import { EASE_GLIDE } from '@shared/lib'
import {
  fmtRub,
  getPackMeta,
  savingsPercent,
  unitPriceRub,
  type SplashColor,
} from '@entities/pack'
import type { GenerationPackOption } from '@shared/api'

interface PackCardProps {
  option: GenerationPackOption
  unitBaseMinor: number
  active: boolean
  featured: boolean
  index: number
  onSelect: (quantity: number) => void
}

const SPLASH_TOKENS: Record<
  SplashColor,
  { bg: string; ring: string; accent: string; glow: string }
> = {
  rose: {
    bg: 'rgba(224,63,106,0.16)',
    ring: 'rgba(224,63,106,0.35)',
    accent: '#FF5E83',
    glow: 'rgba(224,63,106,0.55)',
  },
  violet: {
    bg: 'var(--splash-violet-bg)',
    ring: 'rgba(123,92,246,0.35)',
    accent: 'var(--splash-violet)',
    glow: 'rgba(123,92,246,0.45)',
  },
  cyan: {
    bg: 'var(--splash-cyan-bg)',
    ring: 'rgba(63,212,224,0.35)',
    accent: 'var(--splash-cyan)',
    glow: 'rgba(63,212,224,0.45)',
  },
  orange: {
    bg: 'var(--splash-orange-bg)',
    ring: 'rgba(255,138,76,0.35)',
    accent: 'var(--splash-orange)',
    glow: 'rgba(255,138,76,0.45)',
  },
  green: {
    bg: 'var(--splash-green-bg)',
    ring: 'rgba(95,210,150,0.35)',
    accent: 'var(--splash-green)',
    glow: 'rgba(95,210,150,0.45)',
  },
}

export function PackCard({
  option,
  unitBaseMinor,
  active,
  featured,
  index,
  onSelect,
}: PackCardProps) {
  const meta = getPackMeta(option)
  const tokens = SPLASH_TOKENS[meta.splash]
  const savings = savingsPercent(option, unitBaseMinor)
  const unit = unitPriceRub(option)

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: EASE_GLIDE }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(option.quantity)}
      className="relative w-full text-left no-tap-highlight"
      style={{
        borderRadius: 22,
        padding: featured ? '20px 18px' : '16px 16px',
        minHeight: featured ? 124 : 96,
        background: active
          ? `linear-gradient(135deg, ${tokens.bg} 0%, rgba(15,13,18,0.95) 100%)`
          : 'rgba(255,255,255,0.04)',
        border: active
          ? `1.5px solid ${tokens.accent}`
          : featured
            ? `1px solid ${tokens.ring}`
            : '1px solid var(--border-1)',
        boxShadow: active
          ? `0 0 0 4px ${tokens.bg}, 0 18px 44px -12px ${tokens.glow}`
          : featured
            ? `0 12px 32px -16px ${tokens.glow}`
            : 'inset 0 1px 0 rgba(255,255,255,0.04)',
        transition: 'border-color 0.2s var(--ease-glide), box-shadow 0.2s var(--ease-glide)',
      }}
    >
      <div className="flex items-center justify-between gap-3 relative">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: featured ? 52 : 44,
              height: featured ? 52 : 44,
              borderRadius: featured ? 16 : 13,
              background: tokens.bg,
              border: `1px solid ${tokens.ring}`,
            }}
          >
            <span
              className="font-sans"
              style={{
                fontSize: featured ? 22 : 18,
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: tokens.accent,
                lineHeight: 1,
              }}
            >
              {option.quantity}
            </span>
          </div>

          <div className="flex flex-col gap-0.5 min-w-0">
            <span
              className="font-sans"
              style={{
                fontSize: featured ? 19 : 17,
                fontWeight: 700,
                letterSpacing: '-0.018em',
                color: 'var(--text)',
                lineHeight: 1.1,
              }}
            >
              {meta.title}
            </span>
            <span
              className="font-sans"
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.55)',
                fontWeight: 500,
              }}
            >
              {meta.sub}
              {savings > 0 && (
                <>
                  <span style={{ opacity: 0.35 }}> · </span>
                  <span style={{ color: tokens.accent, fontWeight: 600 }}>
                    −{savings}%
                  </span>
                </>
              )}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          <span
            className="font-sans tabular-nums"
            style={{
              fontSize: featured ? 22 : 19,
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: active ? tokens.accent : 'var(--text)',
              lineHeight: 1,
            }}
          >
            {fmtRub(option.price_minor)}
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.45)',
                marginLeft: 2,
              }}
            >
              ₽
            </span>
          </span>
          <span
            className="font-sans tabular-nums"
            style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}
          >
            {unit} ₽/фото
          </span>
        </div>
      </div>

      {meta.badge && (
        <span
          className="absolute left-4 font-sans"
          style={{
            top: -10,
            padding: '3px 8px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '-0.005em',
            background: tokens.accent,
            color: '#fff',
            boxShadow: `0 6px 18px ${tokens.glow}, inset 0 1px 0 rgba(255,255,255,0.22)`,
          }}
        >
          {meta.badge}
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-[inherit] pointer-events-none"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              boxShadow: `0 10px 30px ${tokens.accent}, inset 0 1px 0 rgba(255,255,255,0.32)`,
              borderRadius: 6,
            }}
          />
        </span>
      )}

      {active && (
        <span
          aria-hidden
          className="absolute top-3 right-3 inline-flex items-center justify-center rounded-full"
          style={{
            width: 18,
            height: 18,
            background: tokens.accent,
            boxShadow: `0 0 12px ${tokens.glow}`,
          }}
        >
          <Check size={11} color="#fff" weight="bold" />
        </span>
      )}

      {active && featured && <SparkleBurst count={6} radius={48} color={tokens.accent} />}

      {!active && featured && (
        <Lightning
          size={12}
          weight="fill"
          color={tokens.accent}
          className="absolute top-3 right-3 animate-breathe"
        />
      )}
    </motion.button>
  )
}
