'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CaretDown, Info } from '@phosphor-icons/react'
import { tt, useLang } from '@shared/lib'

interface Props {
  text: string
}

export function DisclaimerToggle({ text }: Props) {
  useLang()
  const [open, setOpen] = useState(false)
  if (!text) return null
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border-1)',
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="no-tap-highlight flex w-full items-center gap-2 px-4 py-2.5"
      >
        <Info size={14} color="var(--rose)" weight="duotone" />
        <span
          className="flex-1 text-left font-sans"
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '-0.005em',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          {tt({ ru: 'Юридические условия', en: 'Legal terms', de: 'Rechtliche Bedingungen' })}
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
              className="whitespace-pre-wrap px-4 pb-3 text-[12px] leading-relaxed"
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
