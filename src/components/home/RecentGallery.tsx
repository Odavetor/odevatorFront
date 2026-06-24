'use client'

import { memo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkle } from '@phosphor-icons/react'
import { haptic } from '@/lib/telegram'
import { tt, useLang } from '@shared/lib'
import { useContent } from '@/lib/content'
import type { HistoryItem } from '@/types'

interface Props {
  items: HistoryItem[]
}

// Asymmetric grid pattern: 2-col layout with varied heights for masonry feel
const HEIGHT_PATTERN = ['168px', '128px', '128px', '168px']

function RecentGalleryBase({ items }: Props) {
  useLang()
  const emptyTitle = useContent('home.empty.title')
  const emptyBody = useContent('home.empty.body')
  const recentTitle = tt({ ru: 'Последние работы', en: 'Recent results', de: 'Letzte Ergebnisse' })

  if (items.length === 0) {
    return (
      <section className="mt-10 px-5">
        <div className="mb-3 flex items-baseline justify-between">
          <h2
            className="font-sans"
            style={{
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: 'var(--text)',
            }}
          >
            {recentTitle}
          </h2>
        </div>

        <Link
          href="/generate"
          onClick={() => haptic('light')}
          className="relative block overflow-hidden rounded-3xl"
          style={{
            border: '1px dashed var(--border-rose)',
            background:
              'linear-gradient(135deg, rgba(224,63,106,0.06) 0%, rgba(31,25,41,0.4) 100%)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <div className="flex items-start gap-4 px-5 py-6">
            <div
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{
                background: 'var(--rose-dim)',
                border: '1px solid var(--border-rose)',
              }}
            >
              <Sparkle size={20} color="var(--rose)" weight="duotone" />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="mb-1 font-medium"
                style={{ fontSize: 16, lineHeight: 1.2, color: 'var(--text)' }}
              >
                {emptyTitle}
              </p>
              <p className="text-[12px] leading-snug" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {emptyBody}
              </p>
            </div>
            <ArrowRight size={16} color="var(--rose)" weight="bold" className="mt-1" />
          </div>
        </Link>
      </section>
    )
  }

  // Take 4 items, render in zig-zag asymmetric 2-col grid
  const display = items.slice(0, 4)

  return (
    <section className="mt-10 px-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h2
          className="font-sans"
          style={{
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: 'var(--text)',
          }}
        >
          {recentTitle}
        </h2>
        <Link
          href="/history"
          onClick={() => haptic('light')}
          className="no-tap-highlight inline-flex items-center gap-1"
          style={{
            color: 'var(--rose)',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '-0.01em',
          }}
        >
          {tt({ ru: 'Вся история', en: 'All history', de: 'Ganzer Verlauf' })}
          <ArrowRight size={11} weight="bold" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {display.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: Math.min(i, 4) * 0.05,
              duration: 0.45,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Link
              href="/history"
              onClick={() => haptic('light')}
              className="relative block w-full overflow-hidden rounded-2xl"
              style={{
                height: HEIGHT_PATTERN[i] ?? '140px',
                border: '1px solid var(--border-1)',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Image
                src={item.image_url}
                alt=""
                fill
                sizes="(max-width: 430px) 50vw, 200px"
                className="object-cover"
              />
              {item.expires_in_hours !== undefined && item.expires_in_hours <= 12 && (
                <span
                  className="absolute right-2 top-2 rounded-md px-2 py-0.5 font-sans tabular-nums"
                  style={{
                    background: 'rgba(13,11,16,0.7)',
                    color: 'var(--rose)',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '-0.005em',
                    border: '1px solid var(--border-rose)',
                    backdropFilter: 'blur(10px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(10px) saturate(160%)',
                  }}
                >
                  {item.expires_in_hours}
                  {tt({ ru: 'ч', en: 'h', de: 'Std.' })}
                </span>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default memo(RecentGalleryBase)
