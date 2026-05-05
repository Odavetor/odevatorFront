'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from '@phosphor-icons/react'
import { getTimeGreeting, haptic } from '@/lib/telegram'
import type { HistoryItem } from '@/types'
import BottomNav from '@/components/BottomNav'
import CurrencyPill from '@/components/CurrencyPill'
import { useUser } from '@/components/TelegramProvider'
import { HERO_SAMPLES } from '@/data/hero-samples'

const ROTATE_MS = 4500

function DiptychHero({ index }: { index: number }) {
  const sample = HERO_SAMPLES[index]
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: '1.05 / 1' }}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={sample.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="absolute inset-0 grid grid-cols-2"
        >
          <div className="relative overflow-hidden">
            <Image
              src={sample.before}
              alt="до"
              fill
              sizes="(max-width: 430px) 50vw, 215px"
              className="object-cover"
              priority
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to right, transparent 65%, rgba(13,13,15,0.45) 100%)' }}
            />
            <div
              className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-medium tracking-[0.14em]"
              style={{ background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.7)' }}
            >
              ДО
            </div>
          </div>
          <div className="relative overflow-hidden">
            <Image
              src={sample.after}
              alt="после"
              fill
              sizes="(max-width: 430px) 50vw, 215px"
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to left, transparent 70%, rgba(13,13,15,0.35) 100%)' }}
            />
            <div
              className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-medium tracking-[0.14em]"
              style={{ background: 'var(--rose)', color: '#fff' }}
            >
              ПОСЛЕ
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Hairline divider */}
      <div
        className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px pointer-events-none z-10"
        style={{ background: 'rgba(255,255,255,0.18)' }}
      />

      {/* Bottom fade — for headline readability */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-10"
        style={{
          background:
            'linear-gradient(to top, var(--bg) 0%, rgba(13,13,15,0.6) 35%, transparent 100%)',
        }}
      />

      {/* Sample label — bottom right, micro-mono */}
      <AnimatePresence mode="wait">
        <motion.p
          key={sample.id + '-label'}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -2 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="absolute bottom-4 right-5 font-mono uppercase z-20"
          style={{
            fontSize: 10,
            letterSpacing: '0.18em',
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          {sample.label}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

function RecentStrip({ items }: { items: HistoryItem[] }) {
  if (!items.length) return null
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
      {items.slice(0, 6).map((item) => (
        <div
          key={item.id}
          className="relative flex-shrink-0 w-[72px] h-[116px] rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--border-1)' }}
        >
          <Image
            src={item.image_url}
            alt=""
            fill
            sizes="72px"
            className="object-cover"
          />
        </div>
      ))}
      <Link
        href="/history"
        className="flex-shrink-0 w-[72px] h-[116px] rounded-lg flex flex-col items-center justify-center gap-1"
        style={{ background: 'rgba(31,25,41,0.8)', border: '1px solid var(--border-1)' }}
      >
        <ArrowRight size={16} color="var(--text-3)" />
        <span className="text-cream-700 text-[10px]">Все</span>
      </Link>
    </div>
  )
}

export default function HomePage() {
  const { tgUser, userData } = useUser()
  const [recent, setRecent] = useState<HistoryItem[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const greeting = useMemo(() => getTimeGreeting(), [])

  useEffect(() => {
    const uid = tgUser?.id ?? 0
    fetch(`/api/history?userId=${uid}&page=1&perPage=6`)
      .then((r) => r.json())
      .then((d) => setRecent(d?.items ?? []))
      .catch(() => null)
  }, [tgUser?.id])

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % HERO_SAMPLES.length)
    }, ROTATE_MS)
    return () => clearInterval(id)
  }, [])

  const hasCredits = (userData?.active_processes ?? 0) > 0
  const ctaHref = hasCredits ? '/generate' : '/shop'
  const ctaLabel = hasCredits ? 'Начать обработку' : 'Перейти в магазин'

  return (
    <div className="flex flex-col min-h-[100dvh] relative">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-start justify-between px-5 pt-7 pb-5"
      >
        <div>
          <p className="text-cream-700 text-gr-2xs uppercase tracking-[0.15em] mb-1">{greeting}</p>
          <h1
            className="font-display text-cream-100 leading-none"
            style={{ fontSize: 36, fontWeight: 500, letterSpacing: '-0.01em' }}
          >
            {tgUser?.first_name ?? 'Гость'}
          </h1>
        </div>
        <CurrencyPill />
      </motion.header>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <DiptychHero index={activeIndex} />

        {/* Headline pulls up over the bottom of the diptych */}
        <h2
          className="font-display relative z-20 px-5"
          style={{
            fontSize: 56,
            fontWeight: 500,
            lineHeight: 0.94,
            letterSpacing: '-0.025em',
            color: 'var(--text)',
            marginTop: -56,
          }}
        >
          Трансформируй<br />
          свой образ
        </h2>

        <div className="px-5 mt-4 flex items-center justify-between">
          <Link
            href={ctaHref}
            onClick={() => haptic('medium')}
            className="group inline-flex items-center gap-2 active:opacity-70 transition-opacity"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <span
              className="font-medium text-sm"
              style={{
                color: 'var(--rose)',
                borderBottom: '1px solid var(--rose)',
                paddingBottom: 2,
              }}
            >
              {ctaLabel}
            </span>
            <ArrowRight size={14} color="var(--rose)" weight="bold" />
          </Link>

          {/* Dot pagination */}
          <div className="flex items-center gap-1.5">
            {HERO_SAMPLES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => {
                  haptic('light')
                  setActiveIndex(i)
                }}
                aria-label={`Sample ${i + 1}`}
                className="rounded-full"
                style={{
                  width: i === activeIndex ? 18 : 5,
                  height: 5,
                  background: i === activeIndex ? 'var(--rose)' : 'var(--border-2)',
                  transition: 'width 0.3s ease, background 0.3s ease',
                  WebkitTapHighlightColor: 'transparent',
                }}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {recent.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="px-5 pt-8 pb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-cream-600 text-gr-2xs uppercase tracking-[0.14em]">Последние</p>
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
