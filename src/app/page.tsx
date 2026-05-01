'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkle, ArrowRight, Lightning } from '@phosphor-icons/react'
import { getUser, getTimeGreeting, haptic } from '@/lib/telegram'
import type { TelegramUser, UserData, HistoryItem } from '@/types'
import BottomNav from '@/components/BottomNav'
import CurrencyPill from '@/components/CurrencyPill'

function RecentStrip({ items }: { items: HistoryItem[] }) {
  if (!items.length) return null
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
      {items.slice(0, 6).map((item) => (
        <div
          key={item.id}
          className="flex-shrink-0 w-[88px] h-[142px] rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image_url} alt="" className="w-full h-full object-cover" />
        </div>
      ))}
      <Link
        href="/history"
        className="flex-shrink-0 w-[88px] h-[142px] rounded-xl flex flex-col items-center justify-center gap-1"
        style={{ background: 'rgba(31,25,41,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <ArrowRight size={18} color="#7a4a5e" />
        <span className="text-cream-700 text-[10px]">Все</span>
      </Link>
    </div>
  )
}

export default function HomePage() {
  const [tgUser, setTgUser] = useState<TelegramUser | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [recent, setRecent] = useState<HistoryItem[]>([])
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const user = getUser()
    setTgUser(user)
    setGreeting(getTimeGreeting())

    const uid = user?.id ?? 0

    fetch(`/api/balance?userId=${uid}`)
      .then((r) => r.json())
      .then((d) => setUserData(d?.data ?? null))
      .catch(() => null)

    fetch(`/api/history?userId=${uid}&page=1&perPage=6`)
      .then((r) => r.json())
      .then((d) => setRecent(d?.items ?? []))
      .catch(() => null)
  }, [])

  const hasCredits = (userData?.active_processes ?? 0) > 0

  return (
    <div className="flex flex-col min-h-[100dvh] relative">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-32 -right-24 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(224,63,106,0.07) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-40 -left-20 w-56 h-56 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(180,30,60,0.06) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-start justify-between px-5 pt-7 pb-4"
      >
        <div>
          <p className="text-cream-700 text-gr-2xs uppercase tracking-[0.15em] mb-0.5">{greeting}</p>
          <h1 className="font-display text-gr-xl text-cream-100 leading-tight">
            {tgUser?.first_name ?? 'Гость'}
          </h1>
        </div>

        <CurrencyPill />
      </motion.header>

      {/* Main CTA */}
      <div className="flex-1 flex flex-col justify-center px-5 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Glow aura */}
          <motion.div
            className="absolute -inset-4 rounded-[40px] blur-2xl pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(224,63,106,0.12) 0%, transparent 70%)' }}
            animate={{ opacity: [0.6, 1, 0.6], scale: [0.97, 1.02, 0.97] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          <Link
            href={hasCredits ? '/generate' : '/shop'}
            onClick={() => haptic('medium')}
            className="relative flex flex-col gap-5 w-full rounded-[28px] p-7 overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #1f1929 0%, #271f34 55%, #1f1929 100%)',
              border: '1px solid rgba(224,63,106,0.18)',
              boxShadow: 'inset 0 1px 0 rgba(224,63,106,0.08), 0 8px 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Top shimmer line */}
            <div
              className="absolute top-0 left-8 right-8 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(224,63,106,0.35), transparent)' }}
            />

            <div className="flex items-center justify-between">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(224,63,106,0.12)', border: '1px solid rgba(224,63,106,0.2)' }}
              >
                <Sparkle size={22} color="#e03f6a" weight="fill" />
              </div>
              {hasCredits ? (
                <div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(224,63,106,0.1)', color: '#e03f6a', border: '1px solid rgba(224,63,106,0.18)' }}
                >
                  <Lightning size={12} weight="fill" />
                  {userData?.active_processes} слотов
                </div>
              ) : (
                <div
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(180,30,60,0.12)', color: '#a882c8', border: '1px solid rgba(180,30,60,0.2)' }}
                >
                  Купить слоты
                </div>
              )}
            </div>

            <div>
              <h2 className="font-display text-gr-xl leading-[1.15] text-cream-100 mb-2">
                Трансформируй<br />свой образ
              </h2>
              <p className="text-cream-600 text-sm leading-relaxed max-w-[260px]">
                Загрузи фото — ИИ переодевает за 30–60 секунд
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-rose-400 font-medium text-sm">
                {hasCredits ? 'Начать обработку' : 'Перейти в магазин'}
              </span>
              <ArrowRight size={16} color="#e03f6a" weight="bold" />
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Recent history strip */}
      {recent.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="px-5 pb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-cream-600 text-gr-2xs uppercase tracking-[0.12em]">Последние</p>
            <Link href="/history" className="text-rose-400 text-xs font-medium">
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
