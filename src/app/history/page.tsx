'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { getUser } from '@/lib/telegram'
import type { HistoryItem } from '@/types'
import HistoryGrid from '@/components/HistoryGrid'
import BottomNav from '@/components/BottomNav'
import CurrencyPill from '@/components/CurrencyPill'

const PER_PAGE = 10

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const load = useCallback(
    async (p: number) => {
      const user = getUser()
      const uid = user?.id ?? 0

      setLoading(true)
      try {
        const res = await fetch(`/api/history?userId=${uid}&page=${p}&perPage=${PER_PAGE}`)
        const data = await res.json()
        if (data.items) {
          setItems((prev) => (p === 1 ? data.items : [...prev, ...data.items]))
          setTotal(data.total ?? 0)
        }
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    load(1)
  }, [load])

  const hasMore = items.length < total

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="px-5 pt-7 pb-4"
      >
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-display text-gr-xl text-cream-100">История</h1>
          <CurrencyPill />
        </div>
        <p className="text-cream-700 text-gr-2xs uppercase tracking-[0.15em]">Хранятся 3 дня</p>
        {total > 0 && (
          <p className="text-cream-700 text-gr-xs mt-1">{total} результатов</p>
        )}
      </motion.header>

      <div className="flex-1 px-5 pb-4">
        <HistoryGrid items={items} loading={loading && page === 1} />

        {hasMore && !loading && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => {
              const next = page + 1
              setPage(next)
              load(next)
            }}
            className="w-full mt-5 py-3.5 rounded-2xl text-sm font-medium text-cream-600"
            style={{ background: 'rgba(31,25,41,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            Загрузить ещё
          </motion.button>
        )}

        {loading && page > 1 && (
          <div className="flex justify-center py-6">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#e03f6a' }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
