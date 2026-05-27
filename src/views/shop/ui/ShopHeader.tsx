'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Lightning } from '@phosphor-icons/react'
import { DisplayTitle, Kicker } from '@shared/ui'
import { EASE_EDITORIAL, haptic } from '@shared/lib'

interface Props {
  kicker: string
  title: string
  slots: number
}

export function ShopHeader({ kicker, title, slots }: Props) {
  const router = useRouter()
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_EDITORIAL }}
      className="px-5 pt-[max(env(safe-area-inset-top),20px)] pb-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              haptic()
              router.back()
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center no-tap-highlight"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <ArrowLeft size={18} color="rgba(255,255,255,0.7)" weight="bold" />
          </button>
          <div className="flex flex-col gap-1">
            <Kicker tone="rose">{kicker}</Kicker>
            <DisplayTitle size="md">{title}</DisplayTitle>
          </div>
        </div>

        <div
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5"
          style={{
            background: 'rgba(18,18,24,0.45)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          <Lightning size={13} weight="fill" color="var(--rose)" />
          <span
            className="font-sans tabular-nums"
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '-0.005em',
              color: 'rgba(255,255,255,0.92)',
            }}
          >
            {slots}
          </span>
        </div>
      </div>

    </motion.header>
  )
}
