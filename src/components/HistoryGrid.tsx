'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'
import { DownloadSimple, ClockCounterClockwise, X } from '@phosphor-icons/react'
import type { HistoryItem } from '@/types'
import { haptic } from '@/lib/telegram'

interface Props {
  items: HistoryItem[]
  loading?: boolean
}

const HOUR_MS = 3_600_000
const TTL_MS = 72 * HOUR_MS

function timeLeft(createdAt: string): string {
  const expiry = new Date(createdAt).getTime() + TTL_MS
  const diff = expiry - Date.now()
  const h = Math.floor(diff / HOUR_MS)
  if (h < 1) return '< 1ч'
  if (h < 24) return `${h}ч`
  return `${Math.floor(h / 24)}д`
}

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ aspectRatio: '1 / 1.618', background: 'rgba(255,255,255,0.03)' }}
    >
      <div className="w-full h-full skeleton" />
    </div>
  )
}

function ImageCard({ item }: { item: HistoryItem }) {
  const [lightbox, setLightbox] = useState(false)

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    haptic('medium')
    const a = document.createElement('a')
    a.href = item.image_url
    a.download = `velvet-${item.id}.jpg`
    a.target = '_blank'
    a.click()
  }

  const left = timeLeft(item.created_at)
  const expiringSoon = item.expires_in_hours !== undefined && item.expires_in_hours <= 6

  return (
    <>
      <motion.div
        onClick={() => {
          haptic()
          setLightbox(true)
        }}
        className="relative rounded-2xl overflow-hidden cursor-pointer"
        style={{
          aspectRatio: '1 / 1.618',
          border: '1px solid var(--border-1)',
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <Image
          src={item.image_url}
          alt=""
          fill
          sizes="(max-width: 430px) 50vw, 215px"
          className="object-cover"
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(13,11,16,0.78) 0%, rgba(13,11,16,0.15) 28%, transparent 55%)',
          }}
        />

        {/* Expiry badge — bottom-left, mono */}
        <div
          className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md px-1.5 py-0.5"
          style={{
            background: 'rgba(13,11,16,0.72)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            border: expiringSoon
              ? '1px solid var(--border-rose)'
              : '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <ClockCounterClockwise
            size={10}
            color={expiringSoon ? 'var(--rose)' : 'rgba(255,255,255,0.55)'}
            weight="fill"
          />
          <span
            className="font-sans tabular-nums"
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '-0.005em',
              color: expiringSoon ? 'var(--rose)' : 'rgba(255,255,255,0.85)',
            }}
          >
            {left}
          </span>
        </div>

        <button
          onClick={handleDownload}
          aria-label="Скачать"
          className="absolute bottom-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background: 'var(--rose-dim)',
            border: '1px solid var(--border-rose)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <DownloadSimple size={13} color="var(--rose)" weight="bold" />
        </button>
      </motion.div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{
              background: 'rgba(13,11,16,0.94)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-full max-h-[85dvh] rounded-3xl overflow-hidden"
              style={{ border: '1px solid var(--border-1)' }}
            >
              <Image
                src={item.image_url}
                alt=""
                width={800}
                height={1294}
                className="max-w-full max-h-[85dvh] object-contain w-auto h-auto"
                priority
              />
              <button
                onClick={() => setLightbox(false)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(13,11,16,0.7)',
                  border: '1px solid var(--border-2)',
                }}
              >
                <X size={16} color="var(--text)" weight="bold" />
              </button>
              <button
                onClick={handleDownload}
                className="absolute bottom-4 right-4 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium"
                style={{
                  background: 'var(--rose-dim)',
                  border: '1px solid var(--border-rose)',
                  color: 'var(--rose)',
                }}
              >
                <DownloadSimple size={15} weight="bold" />
                Сохранить
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function HistorySkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export default function HistoryGrid({ items, loading }: Props) {
  if (loading) return <HistorySkeletonGrid count={6} />

  if (!items.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center justify-center py-16 gap-4 text-center"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px dashed var(--border-rose)',
          }}
        >
          <ClockCounterClockwise size={26} color="var(--rose)" weight="duotone" />
        </div>
        <div className="max-w-[260px]">
          <p
            className="font-medium mb-1"
            style={{ fontSize: 16, lineHeight: 1.2, color: 'var(--text)' }}
          >
            Пока пусто
          </p>
          <p className="text-[12px] leading-snug" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Создайте первую обработку — она появится здесь и пробудет 72 часа.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.32,
            delay: Math.min(i, 5) * 0.035,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <ImageCard item={item} />
        </motion.div>
      ))}
    </div>
  )
}
