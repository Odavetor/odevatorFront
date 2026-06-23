'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Camera } from '@phosphor-icons/react'
import { PremiumButton } from '@shared/ui'
import { EASE_EDITORIAL, haptic, tt, useLang } from '@shared/lib'

export function EmptyState() {
  useLang()
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_EDITORIAL }}
      className="relative flex flex-col items-center overflow-hidden rounded-3xl px-6 py-10 text-center"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border-1)',
      }}
    >
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          background: 'var(--rose-dim)',
          border: '1px solid var(--border-rose)',
        }}
      >
        <Camera size={28} weight="duotone" color="var(--rose)" />
      </div>

      <h3
        className="mb-2 font-sans"
        style={{
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: '-0.025em',
          color: 'var(--text)',
          lineHeight: 1.1,
        }}
      >
        {tt({ ru: 'Тут пока пусто', en: 'Nothing here yet', de: 'Noch nichts hier' })}
      </h3>

      <p
        className="mb-6 max-w-[28ch] font-sans"
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.4,
        }}
      >
        {tt({
          ru: 'Создай первое фото — оно появится здесь и пробудет 72 часа',
          en: 'Create your first photo — it will appear here and stay for 72 hours',
          de: 'Erstelle dein erstes Foto — es erscheint hier und bleibt 72 Stunden',
        })}
      </p>

      <Link href="/generate" onClick={() => haptic('medium')}>
        <PremiumButton tone="rose" size="md" glow trailing={<ArrowRight size={14} weight="bold" />}>
          {tt({ ru: 'Создать фото', en: 'Create photo', de: 'Foto erstellen' })}
        </PremiumButton>
      </Link>
    </motion.div>
  )
}
