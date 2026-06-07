'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from '@phosphor-icons/react'
import { useContent, LEGAL_SLUG } from '@entities/content'
import { haptic } from '@/lib/telegram'

interface Props {
  checked: boolean[]
  onChange: (index: number, val: boolean) => void
}

export default function ConsentGate({ checked, onChange }: Props) {
  const items = [
    { text: useContent('consent.adult'), href: undefined as string | undefined },
    { text: useContent('consent.terms'), href: `/legal/${LEGAL_SLUG}` },
    { text: useContent('consent.rights'), href: undefined as string | undefined },
  ]

  return (
    <div className="flex flex-col gap-3">
      {items.map(({ text, href }, i) => (
        <div key={i} className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => onChange(i, !checked[i])}
            className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md"
            style={{
              background: checked[i] ? 'var(--rose)' : 'rgba(255,255,255,0.04)',
              border: checked[i] ? 'none' : '1.5px solid var(--border-2)',
              transition: 'all 0.18s ease',
              WebkitTapHighlightColor: 'transparent',
            }}
            aria-pressed={checked[i]}
          >
            <AnimatePresence>
              {checked[i] && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                >
                  <Check size={11} weight="bold" color="white" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {href ? (
            <Link
              href={href}
              onClick={() => haptic('light')}
              className="no-tap-highlight text-sm leading-relaxed underline decoration-1 underline-offset-2"
              style={{ color: checked[i] ? 'rgba(255,255,255,0.85)' : 'var(--rose)' }}
            >
              {text}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => onChange(i, !checked[i])}
              className="text-left text-sm leading-relaxed"
              style={{
                color: checked[i] ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.45)',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {text}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
