'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CaretRight, Lightning, ShareNetwork, ShoppingBag } from '@phosphor-icons/react'
import { EASE_EDITORIAL, haptic } from '@shared/lib'

interface Row {
  href: string
  label: string
  sub: string
  icon: React.ElementType
}

const ROWS: Row[] = [
  {
    href: '/profile/ledger',
    label: 'Слоты и баланс',
    sub: 'движения по кошельку',
    icon: Lightning,
  },
  {
    href: '/profile/payments',
    label: 'Покупки',
    sub: 'история оплат',
    icon: ShoppingBag,
  },
  {
    href: '/profile/referrals',
    label: 'Партнёрка',
    sub: 'приглашай и зарабатывай',
    icon: ShareNetwork,
  },
]

export function DrillDownList() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.18, ease: EASE_EDITORIAL }}
      className="mx-5 mt-4 rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border-1)',
      }}
    >
      {ROWS.map((row, i) => {
        const Icon = row.icon
        return (
          <div key={row.href}>
            {i > 0 && (
              <div
                className="h-px ml-14"
                style={{ background: 'var(--border-1)' }}
              />
            )}
            <Link
              href={row.href}
              onClick={() => haptic('light')}
              className="flex items-center gap-3 px-4 py-3.5 no-tap-highlight active:bg-white/[0.02]"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'var(--rose-dim)',
                  border: '1px solid var(--border-rose)',
                }}
              >
                <Icon size={16} weight="duotone" color="var(--rose)" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-sans"
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: '-0.015em',
                    color: 'var(--text)',
                    lineHeight: 1.15,
                  }}
                >
                  {row.label}
                </p>
                <p
                  className="font-sans"
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.42)',
                    marginTop: 2,
                  }}
                >
                  {row.sub}
                </p>
              </div>
              <CaretRight
                size={14}
                weight="bold"
                color="rgba(255,255,255,0.4)"
                className="flex-shrink-0"
              />
            </Link>
          </div>
        )
      })}
    </motion.section>
  )
}
