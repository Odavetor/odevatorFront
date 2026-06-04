'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { CaretRight, FileText } from '@phosphor-icons/react'
import { listLegalDocs, type LegalDocMeta } from '@entities/content'
import { haptic } from '@/lib/telegram'

export function LegalLinks() {
  const [docs, setDocs] = useState<LegalDocMeta[]>([])

  useEffect(() => {
    let cancelled = false
    listLegalDocs()
      .then((all) => {
        if (!cancelled) setDocs(all.filter((d) => d.has_body))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  if (docs.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mx-5 mt-6"
    >
      <span
        className="font-sans"
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '-0.005em',
          color: 'var(--rose)',
        }}
      >
        Документы
      </span>

      <div
        className="mt-2 overflow-hidden"
        style={{
          borderRadius: 24,
          background: 'linear-gradient(135deg, rgba(31,25,41,0.55) 0%, rgba(13,13,15,0.9) 100%)',
          border: '1px solid var(--border-1)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {docs.map((doc, i) => (
          <Link
            key={doc.slug}
            href={`/legal/${doc.slug}`}
            onClick={() => haptic('light')}
            className="no-tap-highlight flex w-full items-center gap-3 px-4 py-3.5 active:scale-[0.99]"
            style={{
              borderTop: i === 0 ? 'none' : '1px solid var(--border-1)',
              transition: 'transform 0.15s var(--ease-glide)',
            }}
          >
            <span
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-1)' }}
            >
              <FileText size={16} weight="duotone" color="rgba(255,255,255,0.65)" />
            </span>
            <span
              className="min-w-0 flex-1 truncate font-sans"
              style={{
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: 'var(--text)',
              }}
            >
              {doc.title}
            </span>
            <CaretRight size={15} weight="bold" color="rgba(255,255,255,0.35)" />
          </Link>
        ))}
      </div>
    </motion.section>
  )
}
