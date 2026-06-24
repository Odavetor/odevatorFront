'use client'

import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { getTimeGreeting } from '@/lib/telegram'
import { tt, useLang } from '@shared/lib'
import CurrencyPill from '@/components/CurrencyPill'
import { DotPulse } from '@shared/ui'

interface Props {
  firstName: string
}

function HomeHeaderBase({ firstName }: Props) {
  const lang = useLang()
  const greeting = useMemo(() => getTimeGreeting(), [lang])

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative px-5 pb-4 pt-[max(env(safe-area-inset-top),18px)]"
    >
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="mb-4 flex items-center justify-between gap-3"
      >
        <div className="flex min-w-0 items-center gap-2">
          <DotPulse tone="rose" size={12} />
          <p
            className="truncate font-sans"
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
        className="flex items-baseline gap-1.5 font-sans"
        style={{
          fontSize: 30,
          fontWeight: 800,
          lineHeight: 1.0,
          letterSpacing: '-0.028em',
          color: 'var(--text)',
        }}
      >
        <span>{tt({ ru: 'привет,', en: 'hi,', de: 'hallo,' })}</span>
        <span style={{ color: 'var(--rose)' }} className="truncate">
          {firstName.toLowerCase()}
        </span>
      </motion.h1>
    </motion.header>
  )
}

export default memo(HomeHeaderBase)
