'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FileText, ArrowUpRight } from '@phosphor-icons/react'
import { LEGAL_REGISTRY, LEGAL_SLUG, listLegalDocs } from '@entities/content'
import { haptic } from '@/lib/telegram'

export function LegalLinks() {
  const fallbackTitle = LEGAL_REGISTRY[0]?.title ?? 'Пользовательское соглашение'
  const [title, setTitle] = useState(fallbackTitle)

  useEffect(() => {
    let cancelled = false
    listLegalDocs()
      .then((all) => {
        if (cancelled) return
        const doc = all.find((d) => d.slug === LEGAL_SLUG)
        if (doc?.title) setTitle(doc.title)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mt-6 px-5"
    >
      <Link
        href={`/legal/${LEGAL_SLUG}`}
        onClick={() => haptic('light')}
        className="no-tap-highlight group flex items-center gap-3 rounded-2xl px-4 py-3 active:scale-[0.99]"
        style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid var(--border-1)',
          transition: 'transform 0.15s var(--ease-glide)',
        }}
      >
        <span
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-1)' }}
        >
          <FileText size={15} weight="duotone" color="rgba(255,255,255,0.6)" />
        </span>
        <span
          className="min-w-0 flex-1 truncate font-sans"
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          {title}
        </span>
        <ArrowUpRight size={15} weight="bold" color="rgba(255,255,255,0.3)" />
      </Link>
    </motion.div>
  )
}
