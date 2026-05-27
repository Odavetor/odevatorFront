'use client'

import { memo, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from '@phosphor-icons/react'
import { haptic } from '@/lib/telegram'
import { fetchPhotoCatalog } from '@/lib/catalog'
import { PHOTO_FILTER_CATEGORIES } from '@/data/generate-options'
import type { FilterCategory } from '@/data/generate-options'

interface BentoCard {
  id: string
  label: string
  count: number
  thumbnail: string
}

function toCards(cats: FilterCategory[]): BentoCard[] {
  return cats.slice(0, 4).map((c) => ({
    id: c.id,
    label: c.label,
    count: c.options.length,
    thumbnail: c.options[0]?.afterExample ?? '',
  }))
}

// Asymmetric heights — zig-zag bento
const HEIGHTS = ['220px', '170px', '170px', '220px']

function StyleBentoBase() {
  const [cards, setCards] = useState<BentoCard[]>(() => toCards(PHOTO_FILTER_CATEGORIES))

  useEffect(() => {
    let cancelled = false
    fetchPhotoCatalog()
      .then((d) => {
        if (cancelled || !d.categories?.length) return
        setCards(toCards(d.categories))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const totalStyles = cards.reduce((s, c) => s + c.count, 0)

  return (
    <section className="mt-10 px-5">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2
            className="font-sans"
            style={{
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1.05,
              color: 'var(--text)',
            }}
          >
            Что можно сделать
          </h2>
          <p
            className="font-sans mt-1"
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            {totalStyles} стилей в 4 категориях
          </p>
        </div>
        <Link
          href="/generate"
          onClick={() => haptic('light')}
          className="inline-flex items-center gap-1 pb-1 no-tap-highlight"
          style={{
            color: 'var(--rose)',
            borderBottom: '1px solid var(--rose)',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '-0.01em',
          }}
        >
          К фильтрам
          <ArrowRight size={11} weight="bold" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {cards.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: Math.min(i, 4) * 0.07,
              duration: 0.45,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Link
              href="/generate"
              onClick={() => haptic('light')}
              className="group relative block w-full overflow-hidden rounded-3xl"
              style={{
                height: HEIGHTS[i] ?? '200px',
                border: '1px solid var(--border-1)',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {c.thumbnail && (
                <Image
                  src={c.thumbnail}
                  alt={c.label}
                  fill
                  sizes="(max-width: 430px) 50vw, 200px"
                  className="object-cover transition-transform duration-700 ease-out group-active:scale-[1.04]"
                />
              )}

              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to top, rgba(13,11,16,0.92) 0%, rgba(13,11,16,0.4) 35%, transparent 65%)',
                }}
              />

              <div className="absolute left-3.5 right-3.5 bottom-3.5">
                <p
                  className="font-sans"
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    letterSpacing: '-0.022em',
                    lineHeight: 1.05,
                    color: '#fff',
                  }}
                >
                  {c.label}
                </p>
                <p
                  className="font-sans tabular-nums"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.55)',
                    marginTop: 2,
                  }}
                >
                  {c.count} {c.count === 1 ? 'стиль' : c.count < 5 ? 'стиля' : 'стилей'}
                </p>
              </div>

              <span
                aria-hidden
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}
              />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default memo(StyleBentoBase)
