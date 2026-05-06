'use client'

import { memo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkle } from '@phosphor-icons/react'
import { haptic } from '@/lib/telegram'
import { useContent } from '@/lib/content'
import type { HistoryItem } from '@/types'

interface Props {
  items: HistoryItem[]
}

// Asymmetric grid pattern: 2-col layout with varied heights for masonry feel
const HEIGHT_PATTERN = ['168px', '128px', '128px', '168px']

function RecentGalleryBase({ items }: Props) {
  const emptyTitle = useContent('home.empty.title')
  const emptyBody = useContent('home.empty.body')

  if (items.length === 0) {
    return (
      <section className="mt-10 px-5">
        <div className="mb-3 flex items-baseline justify-between">
          <h2
            className="font-mono uppercase"
            style={{
              fontSize: 10,
              letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            Последние работы
          </h2>
        </div>

        <Link
          href="/generate"
          onClick={() => haptic('light')}
          className="block relative overflow-hidden rounded-3xl"
          style={{
            border: '1px dashed var(--border-rose)',
            background:
              'linear-gradient(135deg, rgba(224,63,106,0.06) 0%, rgba(31,25,41,0.4) 100%)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <div className="px-5 py-6 flex items-start gap-4">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'var(--rose-dim)',
                border: '1px solid var(--border-rose)',
              }}
            >
              <Sparkle size={20} color="var(--rose)" weight="duotone" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="font-medium mb-1"
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
          className="font-mono uppercase"
          style={{
            fontSize: 10,
            letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          Последние работы
        </h2>
        <Link
          href="/history"
          onClick={() => haptic('light')}
          className="inline-flex items-center gap-1 text-[11px] font-medium"
          style={{ color: 'var(--rose)' }}
        >
          Вся история
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
              className="block relative w-full overflow-hidden rounded-2xl"
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
                  className="absolute top-2 right-2 px-1.5 py-0.5 rounded font-mono"
                  style={{
                    background: 'rgba(13,11,16,0.78)',
                    color: 'var(--gold)',
                    fontSize: 9,
                    letterSpacing: '0.12em',
                    border: '1px solid rgba(201,150,106,0.28)',
                  }}
                >
                  {item.expires_in_hours}ч
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
