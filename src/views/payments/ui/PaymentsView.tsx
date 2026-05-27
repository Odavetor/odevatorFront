'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from '@phosphor-icons/react'
import { DisplayTitle, Kicker } from '@shared/ui'
import { EASE_EDITORIAL, haptic } from '@shared/lib'
import { fetchPayments } from '@entities/user'
import { BottomNav } from '@widgets/bottom-nav'
import type { PaymentTx } from '@shared/api'
import { PaymentRow } from './PaymentRow'
import { EmptyState } from './EmptyState'

const PER_PAGE = 15

export function PaymentsView() {
  const router = useRouter()
  const [items, setItems] = useState<PaymentTx[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [pageLoading, setPageLoading] = useState(false)
  const [nextBeforeId, setNextBeforeId] = useState<number | undefined>(undefined)
  const [hasMore, setHasMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const load = useCallback(async (beforeId?: number) => {
    const isFirst = beforeId === undefined
    if (isFirst) setInitialLoading(true)
    else setPageLoading(true)
    try {
      const data = await fetchPayments({ limit: PER_PAGE, before_id: beforeId })
      setItems((prev) => (isFirst ? data.items : [...prev, ...data.items]))
      setNextBeforeId(data.next_before_id)
      setHasMore(Boolean(data.next_before_id))
    } finally {
      if (isFirst) setInitialLoading(false)
      else setPageLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || initialLoading || pageLoading) return
    const el = sentinelRef.current
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) load(nextBeforeId)
      },
      { rootMargin: '300px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore, initialLoading, pageLoading, nextBeforeId, load])

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_EDITORIAL }}
        className="px-5 pt-[max(env(safe-area-inset-top),20px)] pb-5"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              haptic()
              router.back()
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center no-tap-highlight"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <ArrowLeft size={18} color="rgba(255,255,255,0.7)" weight="bold" />
          </button>
          <div className="flex flex-col gap-1">
            <Kicker tone="rose">Аккаунт</Kicker>
            <DisplayTitle size="md">Покупки</DisplayTitle>
          </div>
        </div>
      </motion.header>

      <div className="flex-1 px-5 pb-6">
        {initialLoading ? (
          <SkeletonList />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((payment, i) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.28,
                  delay: Math.min(i, 6) * 0.03,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <PaymentRow payment={payment} />
              </motion.div>
            ))}
          </div>
        )}

        {hasMore && !initialLoading && (
          <div ref={sentinelRef} className="flex justify-center py-8">
            {pageLoading ? (
              <div
                className="w-5 h-5 rounded-full"
                style={{
                  border: '1.5px solid var(--border-2)',
                  borderTopColor: 'var(--rose)',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
            ) : (
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: 'var(--border-2)' }}
              />
            )}
          </div>
        )}

        {!hasMore && !initialLoading && items.length > 0 && (
          <div className="flex justify-center pt-8 pb-4">
            <div className="h-px w-12" style={{ background: 'var(--border-2)' }} />
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height: 68, borderRadius: 16 }}
        />
      ))}
    </div>
  )
}
