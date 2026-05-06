'use client'

import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Sparkle } from '@phosphor-icons/react'
import { getTimeGreeting } from '@/lib/telegram'
import CurrencyPill from '@/components/CurrencyPill'

interface Props {
  firstName: string
}

const WEEKDAY_FMT = new Intl.DateTimeFormat('ru', { weekday: 'long' })
const DATE_FMT = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long' })

function HomeHeaderBase({ firstName }: Props) {
  const greeting = useMemo(() => getTimeGreeting(), [])
  const dateLine = useMemo(() => {
    const d = new Date()
    return `${WEEKDAY_FMT.format(d)} · ${DATE_FMT.format(d)}`
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative px-5 pt-[max(env(safe-area-inset-top),18px)] pb-5"
    >
      {/* Top row: live + date | balance */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between gap-3 mb-5"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            aria-hidden
            className="relative flex items-center justify-center"
            style={{ width: 14, height: 14 }}
          >
            {/* Pulsing halo */}
            <span
              className="absolute inset-0 rounded-full animate-glow-pulse"
              style={{
                background: 'rgba(95,210,150,0.4)',
              }}
            />
            <span
              className="relative w-1.5 h-1.5 rounded-full"
              style={{
                background: '#5fd296',
                boxShadow: '0 0 6px rgba(95,210,150,0.65)',
              }}
            />
          </span>
          <p
            className="font-mono uppercase truncate"
            style={{
              fontSize: 10,
              letterSpacing: '0.16em',
              color: 'rgba(255,255,255,0.42)',
            }}
          >
            {dateLine}
          </p>
        </div>
        <CurrencyPill />
      </motion.div>

      {/* Hairline */}
      <div className="h-px mb-5" style={{ background: 'var(--border-1)' }} />

      {/* Greeting + name */}
      <div className="relative">
        <motion.p
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono uppercase mb-2"
          style={{
            fontSize: 10,
            letterSpacing: '0.22em',
            color: 'var(--rose)',
          }}
        >
          {greeting}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="font-display flex items-baseline gap-2 max-w-full"
          style={{
            fontSize: 38,
            fontWeight: 500,
            lineHeight: 0.96,
            letterSpacing: '-0.022em',
            color: 'var(--text)',
          }}
        >
          <span className="truncate">{firstName}</span>
          <span style={{ color: 'var(--rose)', flexShrink: 0 }}>.</span>
        </motion.h1>

        {/* Decorative sparkle in top-right of name area, subtle */}
        <motion.span
          aria-hidden
          initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 top-0"
          style={{ color: 'rgba(201,150,106,0.55)' }}
        >
          <Sparkle size={14} weight="fill" className="animate-float" />
        </motion.span>
      </div>
    </motion.header>
  )
}

export default memo(HomeHeaderBase)
