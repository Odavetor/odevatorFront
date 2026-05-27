'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CaretDown, Info } from '@phosphor-icons/react'

interface Props {
  text: string
}

export function DisclaimerToggle({ text }: Props) {
  const [open, setOpen] = useState(false)
  if (!text) return null
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border-1)',
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-2.5 no-tap-highlight"
      >
        <Info size={14} color="var(--rose)" weight="duotone" />
        <span
          className="font-sans flex-1 text-left"
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '-0.005em',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          Юридические условия
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          <CaretDown size={12} weight="bold" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="px-4 pb-3 text-[12px] leading-relaxed whitespace-pre-wrap"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              {text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
