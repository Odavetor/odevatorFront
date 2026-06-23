'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CaretRight, Lightning, ShareNetwork, ShoppingBag, Star } from '@phosphor-icons/react'
import { EASE_EDITORIAL, haptic, tt, useLang, type Lang } from '@shared/lib'

interface Row {
  href: string
  label: Record<Lang, string>
  sub: Record<Lang, string>
  icon: React.ElementType
}

const ROWS: Row[] = [
  {
    href: '/profile/ledger',
    label: { ru: 'Слоты и баланс', en: 'Slots & balance', de: 'Slots & Guthaben' },
    sub: { ru: 'движения по кошельку', en: 'wallet activity', de: 'Wallet-Bewegungen' },
    icon: Lightning,
  },
  {
    href: '/profile/payments',
    label: { ru: 'Покупки', en: 'Purchases', de: 'Käufe' },
    sub: { ru: 'история оплат', en: 'payment history', de: 'Zahlungsverlauf' },
    icon: ShoppingBag,
  },
  {
    href: '/profile/referrals',
    label: { ru: 'Партнёрка', en: 'Referrals', de: 'Empfehlungen' },
    sub: { ru: 'приглашай и зарабатывай', en: 'invite and earn', de: 'einladen und verdienen' },
    icon: ShareNetwork,
  },
  {
    href: '/profile/review',
    label: { ru: 'Оставить отзыв', en: 'Leave a review', de: 'Bewertung abgeben' },
    sub: { ru: 'оцените сервис', en: 'rate the service', de: 'Service bewerten' },
    icon: Star,
  },
]

export function DrillDownList() {
  useLang()
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.18, ease: EASE_EDITORIAL }}
      className="mx-5 mt-4 overflow-hidden rounded-2xl"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border-1)',
      }}
    >
      {ROWS.map((row, i) => {
        const Icon = row.icon
        return (
          <div key={row.href}>
            {i > 0 && <div className="ml-14 h-px" style={{ background: 'var(--border-1)' }} />}
            <Link
              href={row.href}
              onClick={() => haptic('light')}
              className="no-tap-highlight flex items-center gap-3 px-4 py-3.5 active:bg-white/[0.02]"
            >
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: 'var(--rose-dim)',
                  border: '1px solid var(--border-rose)',
                }}
              >
                <Icon size={16} weight="duotone" color="var(--rose)" />
              </div>
              <div className="min-w-0 flex-1">
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
                  {tt(row.label)}
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
                  {tt(row.sub)}
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
