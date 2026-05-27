'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from '@phosphor-icons/react'
import { DisplayTitle, Kicker } from '@shared/ui'
import { EASE_EDITORIAL } from '@shared/lib'
import { haptic } from '@shared/lib'
import { CurrencyPill } from '@widgets/currency-pill'

interface Props {
  title: string
  subtitle: string
}

export function GenerateHeader({ title, subtitle }: Props) {
  const router = useRouter()
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE_EDITORIAL }}
      className="flex items-center justify-between px-5 pt-6 pb-4"
    >
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
          <Kicker tone="rose">{subtitle}</Kicker>
          <DisplayTitle size="sm">{title}</DisplayTitle>
        </div>
      </div>
      <CurrencyPill />
    </motion.header>
  )
}
