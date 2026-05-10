'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkle } from '@phosphor-icons/react'
import { useUser } from '@/components/TelegramProvider'
import { fetchHistory } from '@/lib/history'
import { useContent } from '@/lib/content'
import { haptic } from '@/lib/telegram'
import type { HistoryItem } from '@/types'
import HistoryGrid, { HistorySkeletonGrid } from '@/components/HistoryGrid'
import BottomNav from '@/components/BottomNav'

const PER_PAGE = 12

interface Group {
  key: string
  label: string
  items: HistoryItem[]
}

function groupByDay(items: HistoryItem[]): Group[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayMs = today.getTime()
  const dayMs = 86_400_000

  const map = new Map<string, Group>()
  const monthFmt = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long' })

  for (const it of items) {
    const d = new Date(it.created_at)
    const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (!map.has(k)) {
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
      let label: string
      if (start === todayMs) label = 'Сегодня'
      else if (start === todayMs - dayMs) label = 'Вчера'
      else label = monthFmt.format(d)
      map.set(k, { key: k, label, items: [] })
    }
    map.get(k)!.items.push(it)
  }
  return Array.from(map.values())
}

export default function HistoryPage() {
  const { tgUser } = useUser()
  const [items, setItems] = useState<HistoryItem[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [pageLoading, setPageLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState<number | null>(null)
  const [nextBeforeId, setNextBeforeId] = useState<number | undefined>(undefined)
  const [hasMore, setHasMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const disclaimerText = useContent('history.disclaimer')
  const titleHistory = useContent('page.title.history')
  const autoRemoveText = useContent('history.autoremove')
  const endText = useContent('history.end')
  const buttonCreate = useContent('button.create')
  const buttonCreateMore = useContent('button.create_more')

  const load = useCallback(
    async (p: number, beforeId?: number) => {
      const isFirst = p === 1
      if (isFirst) setInitialLoading(true)
      else setPageLoading(true)
      try {
        const data = await fetchHistory({
          userId: tgUser?.id ?? 0,
          page: p,
          perPage: PER_PAGE,
          before_id: beforeId,
        })
        const incoming = data.items ?? []
        setItems((prev) => (isFirst ? incoming : [...prev, ...incoming]))
        if (typeof data.total === 'number') {
          setTotal(data.total)
          setHasMore(p === 1 ? incoming.length < data.total : p * PER_PAGE < data.total)
        } else {
          setNextBeforeId(data.next_before_id)
          setHasMore(Boolean(data.next_before_id))
        }
      } finally {
        if (isFirst) setInitialLoading(false)
        else setPageLoading(false)
      }
    },
    [tgUser?.id],
  )

  useEffect(() => {
    load(1)
  }, [load])

  // Infinite scroll: подгружаем когда сентинел в зоне видимости
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || initialLoading || pageLoading) return
    const el = sentinelRef.current
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const next = page + 1
          setPage(next)
          load(next, nextBeforeId)
        }
      },
      { rootMargin: '300px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore, initialLoading, pageLoading, page, nextBeforeId, load])

  const groups = useMemo(() => groupByDay(items), [items])

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="px-5 pt-[max(env(safe-area-inset-top),20px)] pb-5 flex items-end justify-between gap-3"
      >
        <div>
          <p
            className="font-mono uppercase mb-1.5"
            style={{ fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.4)' }}
          >
            {disclaimerText}
          </p>
          <h1
            className="font-display"
            style={{
              fontSize: 32,
              fontWeight: 500,
              lineHeight: 0.95,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
            }}
          >
            {titleHistory}
          </h1>
        </div>
        <Link
          href="/generate"
          onClick={() => haptic('light')}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
          style={{
            background: 'var(--rose-dim)',
            border: '1px solid var(--border-rose)',
            color: 'var(--rose)',
          }}
        >
          <Sparkle size={11} weight="fill" />
          {buttonCreate}
        </Link>
      </motion.header>

      <div className="flex-1 px-5 pb-6">
        {/* Counter row — только если есть данные */}
        {!initialLoading && items.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-baseline justify-between mb-4"
          >
            <span
              className="font-mono"
              style={{
                fontSize: 11,
                letterSpacing: '0.04em',
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              {total !== null
                ? `${total} ${pluralize(total, ['работа', 'работы', 'работ'])}`
                : `${items.length}+`}
            </span>
            {total !== null && total > 0 && (
              <span
                className="font-mono uppercase"
                style={{
                  fontSize: 9,
                  letterSpacing: '0.18em',
                  color: 'rgba(255,255,255,0.32)',
                }}
              >
                {autoRemoveText}
              </span>
            )}
          </motion.div>
        )}

        {initialLoading ? (
          <HistorySkeletonGrid count={8} />
        ) : items.length === 0 ? (
          <HistoryGrid items={[]} loading={false} />
        ) : (
          <div className="flex flex-col gap-7">
            {groups.map((g) => (
              <section key={g.key} className="flex flex-col gap-3">
                <div className="flex items-baseline gap-3">
                  <p
                    className="font-display"
                    style={{
                      fontSize: 18,
                      fontWeight: 500,
                      letterSpacing: '-0.01em',
                      color: 'var(--text-2)',
                    }}
                  >
                    {g.label}
                  </p>
                  <div className="flex-1 h-px" style={{ background: 'var(--border-1)' }} />
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: '0.04em',
                      color: 'rgba(255,255,255,0.32)',
                    }}
                  >
                    {g.items.length}
                  </span>
                </div>
                <HistoryGrid items={g.items} />
              </section>
            ))}
          </div>
        )}

        {/* Sentinel + spinner для infinite scroll */}
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

        {/* "Это всё" — когда подгрузили все */}
        {!hasMore && !initialLoading && items.length > 0 && (
          <div className="flex flex-col items-center gap-3 py-10">
            <div className="w-8 h-px" style={{ background: 'var(--border-2)' }} />
            <p
              className="font-mono uppercase"
              style={{
                fontSize: 9,
                letterSpacing: '0.22em',
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              {endText}
            </p>
            <Link
              href="/generate"
              onClick={() => haptic('light')}
              className="inline-flex items-center gap-1.5 text-xs font-medium pb-1"
              style={{ color: 'var(--rose)', borderBottom: '1px solid var(--rose)' }}
            >
              {buttonCreateMore}
              <ArrowRight size={11} weight="bold" />
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

function pluralize(n: number, forms: [string, string, string]): string {
  const a = Math.abs(n) % 100
  const b = a % 10
  if (a > 10 && a < 20) return forms[2]
  if (b > 1 && b < 5) return forms[1]
  if (b === 1) return forms[0]
  return forms[2]
}
