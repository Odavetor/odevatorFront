'use client'

import Link from 'next/link'
import { ArrowRight, ShoppingBag } from '@phosphor-icons/react'
import { PremiumButton } from '@shared/ui'
import { haptic } from '@shared/lib'

export function EmptyState() {
  return (
    <div
      className="flex flex-col items-center text-center px-6 py-10 rounded-3xl"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border-1)',
      }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: 'var(--rose-dim)',
          border: '1px solid var(--border-rose)',
        }}
      >
        <ShoppingBag size={24} weight="duotone" color="var(--rose)" />
      </div>
      <h3
        className="font-sans mb-2"
        style={{
          fontSize: 20,
          fontWeight: 800,
          letterSpacing: '-0.025em',
          color: 'var(--text)',
        }}
      >
        Покупок пока нет
      </h3>
      <p
        className="font-sans max-w-[26ch] mb-6"
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.4,
        }}
      >
        Когда возьмёшь первый пакет — он появится тут
      </p>
      <Link href="/shop" onClick={() => haptic('medium')}>
        <PremiumButton tone="rose" size="md" glow trailing={<ArrowRight size={14} weight="bold" />}>
          В магазин
        </PremiumButton>
      </Link>
    </div>
  )
}
