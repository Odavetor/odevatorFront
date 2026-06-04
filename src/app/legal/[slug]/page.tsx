'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from '@phosphor-icons/react'
import { getLegalDoc, LEGAL_REGISTRY, type LegalDoc } from '@entities/content'
import { haptic } from '@/lib/telegram'

export default function LegalPage() {
  const router = useRouter()
  const params = useParams<{ slug: string }>()
  const slug = typeof params.slug === 'string' ? params.slug : ''
  const fallbackTitle = LEGAL_REGISTRY.find((d) => d.slug === slug)?.title ?? 'Документ'

  const [doc, setDoc] = useState<LegalDoc | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoaded(false)
    getLegalDoc(slug)
      .then((d) => {
        if (cancelled) return
        setDoc(d)
        setLoaded(true)
      })
      .catch(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  const title = doc?.title || fallbackTitle
  const body = doc?.body?.trim() ?? ''

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
            lineHeight: 1.1,
            color: 'var(--text)',
          }}
        >
          {title}
        </h1>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 px-5 pb-16"
      >
        {!loaded ? (
          <p className="font-sans" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Загрузка…
          </p>
        ) : body ? (
          <p
            className="font-sans whitespace-pre-wrap"
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            {body}
          </p>
        ) : (
          <p className="font-sans" style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>
            Документ пока не заполнен.
          </p>
        )}
      </motion.div>
    </div>
  )
}
