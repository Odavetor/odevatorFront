'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Camera } from '@phosphor-icons/react'
import { PremiumButton } from '@shared/ui'
import { EASE_EDITORIAL, haptic } from '@shared/lib'

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_EDITORIAL }}
      className="relative overflow-hidden flex flex-col items-center text-center px-6 py-10 rounded-3xl"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border-1)',
      }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: 'var(--rose-dim)',
          border: '1px solid var(--border-rose)',
        }}
      >
        <Camera size={28} weight="duotone" color="var(--rose)" />
      </div>

      <h3
        className="font-sans mb-2"
        style={{
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: '-0.025em',
          color: 'var(--text)',
          lineHeight: 1.1,
        }}
      >
        Тут пока пусто
      </h3>

      <p
        className="font-sans mb-6 max-w-[28ch]"
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.4,
        }}
      >
        Создай первое фото — оно появится здесь и пробудет 72 часа
      </p>

      <Link href="/generate" onClick={() => haptic('medium')}>
        <PremiumButton tone="rose" size="md" glow trailing={<ArrowRight size={14} weight="bold" />}>
          Создать фото
        </PremiumButton>
      </Link>
    </motion.div>
  )
}
