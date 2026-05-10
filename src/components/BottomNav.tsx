'use client'

import { memo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ClockCounterClockwise,
  House,
  ShoppingBag,
  Sparkle,
  UserCircle,
} from '@phosphor-icons/react'
import { hapticSelect } from '@/lib/telegram'
import { useContent } from '@/lib/content'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
}

function BottomNavBase() {
  const pathname = usePathname()

  const LEFT: NavItem[] = [
    { href: '/', icon: House, label: useContent('nav.home') },
    { href: '/history', icon: ClockCounterClockwise, label: useContent('nav.history') },
  ]
  const RIGHT: NavItem[] = [
    { href: '/shop', icon: ShoppingBag, label: useContent('nav.shop') },
    { href: '/profile', icon: UserCircle, label: useContent('nav.profile') },
  ]
  const FAB: NavItem = { href: '/generate', icon: Sparkle, label: useContent('nav.generate') }
  const fabActive = pathname === FAB.href

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pointer-events-none"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom), 10px)',
      }}
    >
      {/* Soft fade подложка чтобы контент за баром не сливался при скролле */}
      <div
        aria-hidden
        className="absolute left-0 right-0 bottom-0 h-32 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, var(--bg) 30%, rgba(13,13,15,0.6) 70%, transparent 100%)',
        }}
      />

      <div className="relative mx-4 pointer-events-auto" style={{ overflow: 'visible' }}>
        <div
          className="relative rounded-full"
          style={{
            background:
              'linear-gradient(180deg, rgba(28,24,36,0.78) 0%, rgba(15,13,18,0.92) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(28px) saturate(140%)',
            WebkitBackdropFilter: 'blur(28px) saturate(140%)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 36px rgba(0,0,0,0.45)',
          }}
        >
          <div
            className="flex items-end justify-between"
            style={{ paddingLeft: 6, paddingRight: 6, paddingTop: 9, paddingBottom: 8 }}
          >
            {LEFT.map((it) => (
              <SideItem key={it.href} item={it} active={pathname === it.href} />
            ))}
            <CenterFab item={FAB} active={fabActive} />
            {RIGHT.map((it) => (
              <SideItem key={it.href} item={it} active={pathname === it.href} />
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

function SideItem({ item, active }: { item: NavItem; active: boolean }) {
  const { icon: Icon, href, label } = item
  return (
    <Link
      href={href}
      onClick={hapticSelect}
      aria-label={label}
      className="relative flex flex-col items-center gap-1 px-3 py-1 flex-1"
      style={{
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <motion.div
        whileTap={{ scale: 0.88 }}
        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        className="relative flex items-center justify-center"
        style={{ width: 24, height: 24 }}
      >
        {/* Активный индикатор: rose dot над иконкой, layoutId для плавного перелёта */}
        {active && (
          <motion.div
            layoutId="nav-active-dot"
            className="absolute"
            style={{
              top: -7,
              width: 4,
              height: 4,
              borderRadius: 999,
              background: 'var(--rose)',
              boxShadow: '0 0 8px rgba(224,63,106,0.7)',
            }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
        <Icon
          size={22}
          weight={active ? 'fill' : 'regular'}
          color={active ? 'var(--rose)' : 'rgba(255,255,255,0.4)'}
          style={{ transition: 'color 0.2s ease' }}
        />
      </motion.div>
      <span
        className="font-mono uppercase leading-none"
        style={{
          fontSize: 8,
          letterSpacing: '0.16em',
          color: active ? 'var(--rose)' : 'rgba(255,255,255,0.34)',
          transition: 'color 0.2s ease',
        }}
      >
        {label}
      </span>
    </Link>
  )
}

function CenterFab({ item, active }: { item: NavItem; active: boolean }) {
  const { icon: Icon, href, label } = item
  return (
    <Link
      href={href}
      onClick={hapticSelect}
      aria-label={label}
      className="relative flex flex-col items-center flex-1"
      style={{
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <motion.div
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 380, damping: 22 }}
        className="relative flex items-center justify-center"
        style={{
          width: 52,
          height: 52,
          marginTop: -22, // raised above bar
          marginBottom: 4,
          borderRadius: 999,
          background: 'linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%)',
          boxShadow:
            '0 10px 28px rgba(224,63,106,0.42), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.22)',
        }}
      >
        {/* Внешнее кольцо-подложка — отделяет FAB от навбара */}
        <span
          aria-hidden
          className="absolute inset-[-4px] rounded-full pointer-events-none"
          style={{ background: 'var(--bg)', zIndex: -1 }}
        />

        <Icon size={22} weight="fill" color="#fff" />

        {/* Pulsing ring когда мы на /generate */}
        {active && (
          <>
            <motion.span
              aria-hidden
              className="absolute rounded-full pointer-events-none"
              style={{ inset: -3, border: '1.5px solid var(--rose)' }}
              animate={{ scale: [1, 1.22, 1.22], opacity: [0.6, 0, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.span
              aria-hidden
              className="absolute rounded-full pointer-events-none"
              style={{ inset: -3, border: '1.5px solid var(--rose)' }}
              animate={{ scale: [1, 1.22, 1.22], opacity: [0.6, 0, 0] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 1.1,
              }}
            />
          </>
        )}
      </motion.div>

      <span
        className="font-mono uppercase leading-none"
        style={{
          fontSize: 8,
          letterSpacing: '0.16em',
          color: active ? 'var(--rose)' : 'rgba(255,255,255,0.55)',
          transition: 'color 0.2s ease',
        }}
      >
        {label}
      </span>
    </Link>
  )
}

export default memo(BottomNavBase)
