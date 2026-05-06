'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check } from '@phosphor-icons/react'
import { useContent } from '@/lib/content'

interface Props {
  checked: boolean[]
  onChange: (index: number, val: boolean) => void
}

export default function ConsentGate({ checked, onChange }: Props) {
  const items = [
    useContent('consent.adult'),
    useContent('consent.terms'),
    useContent('consent.rights'),
  ]
  return (
    <div className="flex flex-col gap-3">
      {items.map((text, i) => (
        <button
          key={i}
          onClick={() => onChange(i, !checked[i])}
          className="flex items-start gap-3 text-left w-full"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <div
            className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center mt-0.5"
            style={{
              background: checked[i] ? 'var(--rose)' : 'rgba(255,255,255,0.04)',
              border: checked[i] ? 'none' : '1.5px solid var(--border-2)',
              transition: 'all 0.18s ease',
            }}
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
          </div>
          <span
            className="text-sm leading-relaxed"
            style={{ color: checked[i] ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.45)' }}
          >
            {text}
          </span>
        </button>
      ))}
    </div>
  )
}
