'use client'

import { memo, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from '@phosphor-icons/react'
import { haptic } from '@/lib/telegram'
import { pickLabel, tt, useLang } from '@shared/lib'
import { getPhotoCatalogCached } from '@/lib/catalog'
import { PHOTO_FILTER_CATEGORIES } from '@/data/generate-options'
import type { FilterCategory } from '@/data/generate-options'

interface BentoCard {
  id: string
  label: string
  label_en?: string
  label_de?: string
  count: number
  thumbnail: string
}

function toCards(cats: FilterCategory[]): BentoCard[] {
  return cats.slice(0, 4).map((c) => ({
    id: c.id,
    label: c.label,
    label_en: c.label_en,
    label_de: c.label_de,
    count: c.options.length,
    thumbnail: c.options[0]?.afterExample ?? '',
  }))
}

interface CatalogStats {
  styles: number
  categories: number
}

function toStats(cats: FilterCategory[]): CatalogStats {
  return {
    styles: cats.reduce((s, c) => s + c.options.length, 0),
    categories: cats.length,
  }
}

function plural(n: number, forms: [string, string, string]): string {
  const mod100 = Math.abs(n) % 100
  const mod10 = mod100 % 10
  if (mod100 > 10 && mod100 < 20) return forms[2]
  if (mod10 === 1) return forms[0]
  if (mod10 > 1 && mod10 < 5) return forms[1]
  return forms[2]
}

// Asymmetric heights — zig-zag bento
const HEIGHTS = ['220px', '170px', '170px', '220px']

function StyleBentoBase() {
  useLang() // re-render labels when the active language changes
  const [cards, setCards] = useState<BentoCard[]>(() => toCards(PHOTO_FILTER_CATEGORIES))
  const [stats, setStats] = useState<CatalogStats>(() => toStats(PHOTO_FILTER_CATEGORIES))

  useEffect(() => {
    let cancelled = false
    getPhotoCatalogCached()
      .then((d) => {
        if (cancelled || !d.categories?.length) return
        setCards(toCards(d.categories))
        setStats(toStats(d.categories))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

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
            {tt({ ru: 'Что можно сделать', en: 'What you can do', de: 'Was möglich ist' })}
          </h2>
          <p
            className="mt-1 font-sans"
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            {stats.styles}{' '}
            {tt({
              ru: plural(stats.styles, ['стиль', 'стиля', 'стилей']),
              en: stats.styles === 1 ? 'style' : 'styles',
              de: stats.styles === 1 ? 'Stil' : 'Stile',
            })}{' '}
            {tt({ ru: 'в', en: 'in', de: 'in' })} {stats.categories}{' '}
            {tt({
              ru: plural(stats.categories, ['категории', 'категориях', 'категориях']),
              en: stats.categories === 1 ? 'category' : 'categories',
              de: stats.categories === 1 ? 'Kategorie' : 'Kategorien',
            })}
          </p>
        </div>
        <Link
          href="/generate"
          onClick={() => haptic('light')}
          className="no-tap-highlight inline-flex items-center gap-1 pb-1"
          style={{
            color: 'var(--rose)',
            borderBottom: '1px solid var(--rose)',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '-0.01em',
          }}
        >
          {tt({ ru: 'К фильтрам', en: 'See filters', de: 'Zu den Filtern' })}
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
                  alt={pickLabel(c.label, c.label_en, c.label_de)}
                  fill
                  sizes="(max-width: 430px) 50vw, 200px"
                  className="object-cover transition-transform duration-700 ease-out group-active:scale-[1.04]"
                />
              )}

              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, rgba(13,11,16,0.92) 0%, rgba(13,11,16,0.4) 35%, transparent 65%)',
                }}
              />

              <div className="absolute bottom-3.5 left-3.5 right-3.5">
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
                  {pickLabel(c.label, c.label_en, c.label_de)}
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
                  {c.count}{' '}
                  {tt({
                    ru: plural(c.count, ['стиль', 'стиля', 'стилей']),
                    en: c.count === 1 ? 'style' : 'styles',
                    de: c.count === 1 ? 'Stil' : 'Stile',
                  })}
                </p>
              </div>

              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-3xl"
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
