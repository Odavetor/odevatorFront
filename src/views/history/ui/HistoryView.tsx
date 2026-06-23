'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from '@phosphor-icons/react'
import { useUser } from '@entities/user'
import { fetchHistory, type HistoryItem } from '@entities/generation'
import { useContent } from '@entities/content'
import { haptic, tt, useLang, intlLocale } from '@shared/lib'
import { HistoryGrid, HistorySkeletonGrid } from '@widgets/history-grid'
import { BottomNav } from '@widgets/bottom-nav'
import { HistoryHeader } from './HistoryHeader'
import { GroupHeading } from './GroupHeading'
import { EmptyState } from './EmptyState'

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
  const monthFmt = new Intl.DateTimeFormat(intlLocale(), { day: 'numeric', month: 'long' })

  for (const it of items) {
    const d = new Date(it.created_at)
    const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (!map.has(k)) {
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
      let label: string
      if (start === todayMs) label = tt({ ru: 'сегодня', en: 'today', de: 'heute' })
      else if (start === todayMs - dayMs)
        label = tt({ ru: 'вчера', en: 'yesterday', de: 'gestern' })
      else label = monthFmt.format(d)
      map.set(k, { key: k, label, items: [] })
    }
    map.get(k)!.items.push(it)
  }
  return Array.from(map.values())
}

function pluralize(n: number, forms: [string, string, string]): string {
  const a = Math.abs(n) % 100
  const b = a % 10
  if (a > 10 && a < 20) return forms[2]
  if (b > 1 && b < 5) return forms[1]
  if (b === 1) return forms[0]
  return forms[2]
}

export function HistoryView() {
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

  const lang = useLang()
  const groups = useMemo(() => groupByDay(items), [items, lang])

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <HistoryHeader disclaimer={disclaimerText} title={titleHistory} createLabel={buttonCreate} />

      <div className="flex-1 px-5 pb-6">
        {!initialLoading && items.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mb-4 flex items-baseline justify-between"
          >
            <span
              className="font-sans tabular-nums"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '-0.005em',
              }}
            >
              {total !== null
                ? `${total} ${tt({ ru: pluralize(total, ['работа', 'работы', 'работ']), en: total === 1 ? 'render' : 'renders', de: total === 1 ? 'Ergebnis' : 'Ergebnisse' })}`
                : `${items.length}+`}
            </span>
          </motion.div>
        )}

        {initialLoading ? (
          <HistorySkeletonGrid count={8} />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-7">
            {groups.map((g) => (
              <section key={g.key} className="flex flex-col gap-3">
                <GroupHeading label={g.label} count={g.items.length} />
                <HistoryGrid items={g.items} />
              </section>
            ))}
          </div>
        )}

        {hasMore && !initialLoading && (
          <div ref={sentinelRef} className="flex justify-center py-8">
            {pageLoading ? (
              <div
                className="h-5 w-5 rounded-full"
                style={{
                  border: '1.5px solid var(--border-2)',
                  borderTopColor: 'var(--rose)',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
            ) : (
              <div className="h-2 w-2 rounded-full" style={{ background: 'var(--border-2)' }} />
            )}
          </div>
        )}

        {!hasMore && !initialLoading && items.length > 0 && (
          <div className="flex flex-col items-center gap-3 py-10">
            <div className="h-px w-12" style={{ background: 'var(--border-2)' }} />
            <p
              className="font-sans"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.4)',
                textTransform: 'lowercase',
              }}
            >
              {endText}
            </p>
            <Link
              href="/generate"
              onClick={() => haptic('light')}
              className="no-tap-highlight inline-flex items-center gap-1.5 pb-1"
              style={{
                color: 'var(--rose)',
                borderBottom: '1px solid var(--rose)',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '-0.01em',
              }}
            >
              {buttonCreateMore}
              <ArrowRight size={12} weight="bold" />
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
