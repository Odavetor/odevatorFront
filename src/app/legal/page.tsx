'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, CaretRight, FileText } from '@phosphor-icons/react'
import { listLegalDocs, type LegalDocMeta } from '@entities/content'
import { haptic } from '@/lib/telegram'

export default function LegalIndexPage() {
  const router = useRouter()
  const [docs, setDocs] = useState<LegalDocMeta[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    listLegalDocs()
      .then((all) => {
        if (cancelled) return
        setDocs(all.filter((d) => d.has_body))
        setLoaded(true)
      })
      .catch(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-3 px-5 pb-4 pt-[max(env(safe-area-inset-top),20px)]"
      >
        <button
          onClick={() => {
            haptic('light')
            router.back()
          }}
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <ArrowLeft size={18} color="rgba(255,255,255,0.6)" />
        </button>
        <h1
          className="font-sans"
          style={{
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: 'var(--text)',
          }}
        >
          Документы
        </h1>
      </motion.header>

      <div className="px-5 pb-16">
        {loaded && docs.length === 0 && (
          <p className="font-sans" style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>
            Документы пока не опубликованы.
          </p>
        )}
        <div
          className="overflow-hidden"
          style={{
            borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(31,25,41,0.55) 0%, rgba(13,13,15,0.9) 100%)',
            border: '1px solid var(--border-1)',
            display: docs.length === 0 ? 'none' : 'block',
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
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-1)',
                }}
              >
                <FileText size={16} weight="duotone" color="rgba(255,255,255,0.65)" />
              </span>
              <span
                className="min-w-0 flex-1 truncate font-sans"
                style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}
              >
                {doc.title}
              </span>
              <CaretRight size={15} weight="bold" color="rgba(255,255,255,0.35)" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
