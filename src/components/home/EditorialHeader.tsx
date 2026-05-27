'use client'

import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { getTimeGreeting } from '@/lib/telegram'
import CurrencyPill from '@/components/CurrencyPill'
import { DotPulse } from '@shared/ui'

interface Props {
  firstName: string
}

function HomeHeaderBase({ firstName }: Props) {
  const greeting = useMemo(() => getTimeGreeting(), [])

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative px-5 pt-[max(env(safe-area-inset-top),18px)] pb-4"
    >
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between gap-3 mb-4"
      >
        <div className="flex items-center gap-2 min-w-0">
          <DotPulse tone="rose" size={12} />
          <p
            className="font-sans truncate"
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '-0.005em',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            {greeting}
          </p>
        </div>
        <CurrencyPill />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="font-sans flex items-baseline gap-1.5"
        style={{
          fontSize: 30,
          fontWeight: 800,
          lineHeight: 1.0,
          letterSpacing: '-0.028em',
          color: 'var(--text)',
        }}
      >
        <span>привет,</span>
        <span style={{ color: 'var(--rose)' }} className="truncate">
          {firstName.toLowerCase()}
        </span>
      </motion.h1>
    </motion.header>
  )
}

export default memo(HomeHeaderBase)
