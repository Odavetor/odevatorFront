'use client'

import { memo, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Lightning, Plus } from '@phosphor-icons/react'
import { useUser } from './TelegramProvider'

function CurrencyPillBase() {
  const { userData } = useUser()
  const value = userData?.active_processes ?? null

  const [flash, setFlash] = useState(false)
  const prevRef = useRef<number | null>(null)

  useEffect(() => {
    if (prevRef.current !== null && value !== null && value !== prevRef.current) {
      setFlash(true)
      const t = setTimeout(() => setFlash(false), 600)
      prevRef.current = value
      return () => clearTimeout(t)
    }
    prevRef.current = value
  }, [value])

  return (
    <Link href="/shop" className="no-tap-highlight">
      <motion.span
        className="flex items-center gap-2 pl-3 pr-1 py-1.5 rounded-full"
        animate={{
          boxShadow: flash
            ? '0 0 0 1.5px var(--rose), 0 0 22px rgba(224,63,106,0.55), inset 0 1px 0 rgba(255,255,255,0.12)'
            : 'inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'rgba(18,18,24,0.62)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(14px) saturate(160%)',
          WebkitBackdropFilter: 'blur(14px) saturate(160%)',
        }}
      >
        <Lightning size={13} weight="fill" color="var(--rose)" />
        <span
          className="font-sans tabular-nums leading-none inline-block"
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '-0.005em',
            color: 'rgba(255,255,255,0.95)',
            minWidth: 12,
            overflow: 'hidden',
            position: 'relative',
            height: 14,
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={value ?? 'empty'}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block"
            >
              {value ?? '—'}
            </motion.span>
          </AnimatePresence>
        </span>

        <span
          className="w-5 h-5 rounded-full flex items-center justify-center ml-0.5"
          style={{
            background: 'var(--rose)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
          }}
        >
          <Plus size={10} weight="bold" color="white" />
        </span>
      </motion.span>
    </Link>
  )
}

export default memo(CurrencyPillBase)
