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

function timeLeft(createdAt: string): string {
  const expiry = new Date(createdAt).getTime() + 3 * 24 * 60 * 60 * 1000
  const diff = expiry - Date.now()
  if (diff <= 0) return 'Удалено'
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return `< 1 ч`
  if (h < 24) return `${h} ч`
  return `${Math.floor(h / 24)} д`
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: '1 / 1.618' }}>
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

  return (
    <>
      <motion.div
        onClick={() => {
          haptic()
          setLightbox(true)
        }}
        className="relative rounded-2xl overflow-hidden cursor-pointer"
        style={{ aspectRatio: '1 / 1.618' }}
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

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(13,11,16,0.85) 0%, transparent 50%)' }}
        />

        {/* Expiry badge */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-lg px-2 py-1"
          style={{ background: 'rgba(13,11,16,0.7)', backdropFilter: 'blur(8px)' }}>
          <ClockCounterClockwise size={10} color="#c4889e" />
          <span className="text-cream-700 text-[10px]">{timeLeft(item.created_at)}</span>
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          className="absolute bottom-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(224,63,106,0.2)', border: '1px solid rgba(224,63,106,0.25)' }}
        >
          <DownloadSimple size={13} color="#e03f6a" weight="bold" />
        </button>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(13,11,16,0.92)', backdropFilter: 'blur(16px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-full max-h-[85dvh] rounded-3xl overflow-hidden"
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
                style={{ background: 'rgba(13,11,16,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <X size={16} color="#f2ece6" weight="bold" />
              </button>
              <button
                onClick={handleDownload}
                className="absolute bottom-4 right-4 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium"
                style={{ background: 'rgba(224,63,106,0.2)', border: '1px solid rgba(224,63,106,0.3)', color: '#e03f6a' }}
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

export default function HistoryGrid({ items, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (!items.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center justify-center py-20 gap-4"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(31,25,41,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <ClockCounterClockwise size={28} color="#7a4a5e" weight="duotone" />
        </div>
        <div className="text-center">
          <p className="text-cream-200 font-medium mb-1">История пуста</p>
          <p className="text-cream-700 text-sm">Результаты хранятся 3 дня</p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.35,
            delay: Math.min(i, 5) * 0.04,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <ImageCard item={item} />
        </motion.div>
      ))}
    </div>
  )
}
