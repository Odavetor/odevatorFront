'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Sparkle, ArrowRight, Lightning } from '@phosphor-icons/react'
import { getTimeGreeting, haptic } from '@/lib/telegram'
import type { HistoryItem } from '@/types'
import BottomNav from '@/components/BottomNav'
import CurrencyPill from '@/components/CurrencyPill'
import { useUser } from '@/components/TelegramProvider'

function RecentStrip({ items }: { items: HistoryItem[] }) {
  if (!items.length) return null
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
      {items.slice(0, 6).map((item) => (
        <div
          key={item.id}
          className="relative flex-shrink-0 w-[88px] h-[142px] rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--border-1)' }}
        >
          <Image
            src={item.image_url}
            alt=""
            fill
            sizes="88px"
            className="object-cover"
          />
        </div>
      ))}
      <Link
        href="/history"
        className="flex-shrink-0 w-[88px] h-[142px] rounded-xl flex flex-col items-center justify-center gap-1"
        style={{ background: 'rgba(31,25,41,0.8)', border: '1px solid var(--border-1)' }}
      >
        <ArrowRight size={18} color="var(--text-3)" />
        <span className="text-cream-700 text-[10px]">Все</span>
      </Link>
    </div>
  )
}

export default function HomePage() {
  const { tgUser, userData } = useUser()
  const [recent, setRecent] = useState<HistoryItem[]>([])
  const greeting = useMemo(() => getTimeGreeting(), [])

  useEffect(() => {
    const uid = tgUser?.id ?? 0
    fetch(`/api/history?userId=${uid}&page=1&perPage=6`)
      .then((r) => r.json())
      .then((d) => setRecent(d?.items ?? []))
      .catch(() => null)
  }, [tgUser?.id])

  const hasCredits = (userData?.active_processes ?? 0) > 0

  return (
    <div className="flex flex-col min-h-[100dvh] relative">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-start justify-between px-5 pt-7 pb-4"
      >
        <div>
          <p className="text-cream-700 text-gr-2xs uppercase tracking-[0.15em] mb-1">{greeting}</p>
          <h1 className="font-display text-gr-xl text-cream-100 leading-none" style={{ fontWeight: 500, letterSpacing: '-0.01em' }}>
            {tgUser?.first_name ?? 'Гость'}
          </h1>
        </div>

        <CurrencyPill />
      </motion.header>

      <div className="flex-1 flex flex-col justify-center px-5 py-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href={hasCredits ? '/generate' : '/shop'}
            onClick={() => haptic('medium')}
            className="relative flex flex-col gap-5 w-full rounded-[28px] p-7 overflow-hidden active:scale-[0.99] transition-transform"
            style={{
              background: 'linear-gradient(145deg, #1A1620 0%, #221A2C 55%, #1A1620 100%)',
              border: '1px solid var(--border-rose)',
              boxShadow: 'inset 0 1px 0 rgba(224,63,106,0.06), 0 1px 0 rgba(0,0,0,0.4)',
            }}
          >
            <div
              className="absolute top-0 left-8 right-8 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(224,63,106,0.35), transparent)' }}
            />

            <div className="flex items-center justify-between">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--rose-dim)', border: '1px solid var(--border-rose)' }}
              >
                <Sparkle size={22} color="var(--rose)" weight="fill" />
              </div>
              {hasCredits ? (
                <div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'var(--rose-dim)', color: 'var(--rose)', border: '1px solid var(--border-rose)' }}
                >
                  <Lightning size={12} weight="fill" />
                  {userData?.active_processes} слотов
                </div>
              ) : (
                <div
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-2)', border: '1px solid var(--border-2)' }}
                >
                  Купить слоты
                </div>
              )}
            </div>

            <div>
              <h2 className="font-display text-gr-xl leading-[1.05] text-cream-100 mb-2" style={{ fontWeight: 500, letterSpacing: '-0.015em' }}>
                Трансформируй<br />свой образ
              </h2>
              <p className="text-cream-600 text-sm leading-relaxed max-w-[260px]">
                Загрузи фото — ИИ переодевает за 30–60 секунд
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium text-sm" style={{ color: 'var(--rose)' }}>
                {hasCredits ? 'Начать обработку' : 'Перейти в магазин'}
              </span>
              <ArrowRight size={16} color="var(--rose)" weight="bold" />
            </div>
          </Link>
        </motion.div>
      </div>

      {recent.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="px-5 pb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-cream-600 text-gr-2xs uppercase tracking-[0.12em]">Последние</p>
            <Link href="/history" className="text-xs font-medium" style={{ color: 'var(--rose)' }}>
              Все →
            </Link>
          </div>
          <RecentStrip items={recent} />
        </motion.section>
      )}

      <BottomNav />
    </div>
  )
}
