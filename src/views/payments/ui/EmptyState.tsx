'use client'

import Link from 'next/link'
import { ArrowRight, ShoppingBag } from '@phosphor-icons/react'
import { PremiumButton } from '@shared/ui'
import { haptic, tt, useLang } from '@shared/lib'

export function EmptyState() {
  useLang()
  return (
    <div
      className="flex flex-col items-center rounded-3xl px-6 py-10 text-center"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border-1)',
      }}
    >
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: 'var(--rose-dim)',
          border: '1px solid var(--border-rose)',
        }}
      >
        <ShoppingBag size={24} weight="duotone" color="var(--rose)" />
      </div>
      <h3
        className="mb-2 font-sans"
        style={{
          fontSize: 20,
          fontWeight: 800,
          letterSpacing: '-0.025em',
          color: 'var(--text)',
        }}
      >
        {tt({ ru: 'Покупок пока нет', en: 'No purchases yet', de: 'Noch keine Käufe' })}
      </h3>
      <p
        className="mb-6 max-w-[26ch] font-sans"
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.4,
        }}
      >
        {tt({
          ru: 'Когда возьмёшь первый пакет — он появится тут',
          en: 'Once you grab your first pack, it will show up here',
          de: 'Sobald du dein erstes Paket holst, erscheint es hier',
        })}
      </p>
      <Link href="/shop" onClick={() => haptic('medium')}>
        <PremiumButton tone="rose" size="md" glow trailing={<ArrowRight size={14} weight="bold" />}>
          {tt({ ru: 'В магазин', en: 'To shop', de: 'Zum Shop' })}
        </PremiumButton>
      </Link>
    </div>
  )
}
