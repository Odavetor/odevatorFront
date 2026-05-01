'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { House, Sparkle, ClockCounterClockwise, ShoppingBag, UserCircle } from '@phosphor-icons/react'
import { hapticSelect } from '@/lib/telegram'

const NAV = [
  { href: '/', icon: House, label: 'Главная' },
  { href: '/generate', icon: Sparkle, label: 'Создать' },
  { href: '/history', icon: ClockCounterClockwise, label: 'История' },
  { href: '/shop', icon: ShoppingBag, label: 'Магазин' },
  { href: '/profile', icon: UserCircle, label: 'Профиль' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50"
      style={{
        background: 'linear-gradient(to top, #0D0D0F 80%, transparent)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
      }}
    >
      <div
        className="mx-3 mb-1 flex items-center justify-around rounded-full px-3 py-2.5"
        style={{
          background: 'rgba(18,18,24,0.94)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={hapticSelect}
              aria-label={label}
              className="relative flex flex-col items-center gap-1 py-0.5 px-3 min-w-[44px]"
            >
              {active && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute -inset-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                size={22}
                weight={active ? 'fill' : 'regular'}
                color={active ? '#FFFFFF' : 'rgba(255,255,255,0.32)'}
              />
              <div
                className="w-1 h-1 rounded-full transition-opacity duration-200"
                style={{
                  background: '#E03F6A',
                  opacity: active ? 1 : 0,
                }}
              />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
