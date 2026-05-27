'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkle } from '@phosphor-icons/react'
import { DisplayTitle, Kicker } from '@shared/ui'
import { EASE_EDITORIAL } from '@shared/lib'
import { haptic } from '@/lib/telegram'

interface Props {
  disclaimer: string
  title: string
  createLabel: string
}

export function HistoryHeader({ disclaimer, title, createLabel }: Props) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE_EDITORIAL }}
      className="px-5 pt-[max(env(safe-area-inset-top),20px)] pb-5 flex items-end justify-between gap-3"
    >
      <div className="flex flex-col gap-1">
        <Kicker tone="muted">{disclaimer}</Kicker>
        <DisplayTitle size="md">{title}</DisplayTitle>
      </div>
      <Link
        href="/generate"
        onClick={() => haptic('light')}
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium no-tap-highlight"
        style={{
          background: 'var(--rose-dim)',
          border: '1px solid var(--border-rose)',
          color: 'var(--rose)',
        }}
      >
        <Sparkle size={11} weight="fill" />
        {createLabel}
      </Link>
    </motion.header>
  )
}
