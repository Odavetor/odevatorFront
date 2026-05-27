'use client'

import { memo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { ArrowRight, Lightning } from '@phosphor-icons/react'
import { haptic } from '@/lib/telegram'
import type { HeroSample } from '@/data/hero-samples'

interface Props {
  samples: HeroSample[]
  activeIndex: number
  onSelectIndex: (i: number) => void
  ctaHref: string
  ctaLabel: string
  hasCredits: boolean
  slotsCount: number
  onComparingChange?: (comparing: boolean) => void
}

function CinematicHeroBase({
  samples,
  activeIndex,
  onSelectIndex,
  ctaHref,
  ctaLabel,
  hasCredits,
  slotsCount,
  onComparingChange,
}: Props) {
  const sample = samples[activeIndex]

  // Drag-to-compare разделитель: пользователь тянет линию между до/после.
  // useMotionValue вне React-рендера — fps стабильный.
  const dragX = useMotionValue(0)
  const [containerW, setContainerW] = useState(0)

  // Сдвиг → проценты. Клампим на уровне самого dragX (см. handlePan ниже),
  // поэтому сама функция не нуждается в clamp'е — но оставим для подстраховки на ранних renders.
  const splitPercent = useTransform(dragX, (x) => {
    if (!containerW) return 50
    const pct = 50 + (x / containerW) * 100
    return Math.max(10, Math.min(90, pct))
  })
  const splitWidth = useTransform(splitPercent, (p) => `${p}%`)

  // Границы хода (в px) согласованы с лимитом 10–90% по splitPercent: ±0.4·W
  const maxAbs = containerW > 0 ? containerW * 0.4 : 0

  function handlePanStart() {
    haptic('light')
    onComparingChange?.(true)
  }
  function handlePan(_: PointerEvent, info: { delta: { x: number } }) {
    if (!maxAbs) return
    const next = dragX.get() + info.delta.x
    dragX.set(Math.max(-maxAbs, Math.min(maxAbs, next)))
  }
  function handlePanEnd() {
    onComparingChange?.(false)
  }

  return (
    <section className="relative">
      {/* Diptych */}
      <div
        ref={(el) => {
          if (el && el.clientWidth !== containerW) setContainerW(el.clientWidth)
        }}
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: '1.1 / 1' }}
      >
        <AnimatePresence mode="sync">
          <motion.div
            key={sample.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {/* AFTER — full background */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                initial={{ scale: 1.02 }}
                animate={{ scale: 1.1 }}
                transition={{ duration: 9, ease: 'linear' }}
                className="absolute inset-0"
              >
                <Image
                  src={sample.after}
                  alt="после"
                  fill
                  sizes="(max-width: 430px) 100vw, 430px"
                  className="object-cover"
                />
              </motion.div>
              {/* tonal layer на «после» */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to left, transparent 65%, rgba(13,13,15,0.32) 100%)',
                }}
              />
            </div>

            {/* BEFORE — обрезается по splitPercent (clip-path), даёт slider-эффект */}
            <motion.div
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: splitWidth }}
            >
              <div className="absolute inset-y-0 left-0 right-0">
                <motion.div
                  initial={{ scale: 1.02 }}
                  animate={{ scale: 1.1 }}
                  transition={{ duration: 9, ease: 'linear' }}
                  className="absolute inset-0"
                  style={{
                    width: containerW || '100vw',
                    height: '100%',
                  }}
                >
                  <Image
                    src={sample.before}
                    alt="до"
                    fill
                    priority
                    sizes="(max-width: 430px) 100vw, 430px"
                    className="object-cover"
                  />
                </motion.div>
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to right, transparent 65%, rgba(13,13,15,0.4) 100%)',
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div
          className="absolute top-3 left-3 px-2.5 py-1 rounded-md z-20"
          style={{
            background: 'rgba(13,11,16,0.62)',
            color: 'rgba(255,255,255,0.9)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '-0.005em',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          до
        </div>

        <div
          className="absolute top-3 right-3 px-2.5 py-1 rounded-md z-20"
          style={{
            background: 'var(--rose)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '-0.005em',
            boxShadow: '0 4px 18px rgba(224,63,106,0.55)',
          }}
        >
          после
        </div>

        {/* Divider line + handle — handle приклеен к линии, едет вместе.
            Клампы splitPercent (10–90%) и dragX (см. handlePan) гарантируют,
            что ручка не выходит за края диптиха. */}
        <motion.div
          className="absolute top-0 bottom-0 z-10"
          style={{
            left: splitWidth,
            x: '-50%',
            width: 1,
            background: 'rgba(255,255,255,0.42)',
            boxShadow: '0 0 8px rgba(255,255,255,0.2)',
          }}
        >
          <motion.div
            onPanStart={handlePanStart}
            onPan={handlePan}
            onPanEnd={handlePanEnd}
            whileTap={{ scale: 0.94 }}
            className="absolute top-1/2 left-1/2 pointer-events-auto cursor-grab active:cursor-grabbing touch-none"
            style={{
              // Центрирование задаём через motion-aware x/y (а не tailwind -translate),
              // чтобы whileTap не перезаписывал transform целиком и не съезжал handle.
              x: '-50%',
              y: '-50%',
              width: 32,
              height: 32,
              borderRadius: 999,
              background: 'rgba(15,13,18,0.32)',
              border: '1px solid rgba(255,255,255,0.16)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.28)',
            }}
          >
            <span className="flex items-center gap-px">
              <span
                style={{ width: 1.5, height: 8, background: 'rgba(255,255,255,0.5)', borderRadius: 1 }}
              />
              <span
                style={{ width: 1.5, height: 12, background: 'rgba(255,255,255,0.75)', borderRadius: 1 }}
              />
              <span
                style={{ width: 1.5, height: 8, background: 'rgba(255,255,255,0.5)', borderRadius: 1 }}
              />
            </span>
          </motion.div>
        </motion.div>

        {/* Bottom soft fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-[5]"
          style={{
            background:
              'linear-gradient(to top, var(--bg) 0%, rgba(13,13,15,0.5) 60%, transparent 100%)',
          }}
        />
      </div>

      {/* Headline */}
      <div className="relative px-5 pt-5">
        <h1
          className="font-sans"
          style={{
            fontSize: 36,
            fontWeight: 800,
            lineHeight: 1.0,
            letterSpacing: '-0.028em',
            color: 'var(--text)',
          }}
        >
          Сними одежду
          <br />
          с любого{' '}
          <span style={{ color: 'var(--rose)' }}>фото</span>
        </h1>

        <p
          className="mt-3 text-[14px] leading-snug max-w-[36ch]"
          style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}
        >
          Купальник, бельё, топлес, без одежды.
          <br />
          Результат за 10 секунд.
        </p>
      </div>

      {/* CTA + dots */}
      <div className="px-5 mt-5 flex items-center justify-between gap-3">
        <Link
          href={ctaHref}
          onClick={() => haptic('medium')}
          className="relative inline-flex items-center gap-2 rounded-2xl pl-5 pr-2.5 py-3 active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%)',
            boxShadow: 'var(--shadow-neon-cta)',
            transition: 'transform 0.18s ease',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <span
            className="font-sans"
            style={{
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: '#fff',
            }}
          >
            {hasCredits ? 'Создать фото' : 'Попробовать бесплатно'}
          </span>
          <span
            className="flex items-center gap-1 rounded-xl px-2 py-1 ml-1"
            style={{ background: 'rgba(0,0,0,0.22)' }}
          >
            {hasCredits ? (
              <>
                <Lightning size={11} weight="fill" color="#fff" />
                <span
                  className="font-sans tabular-nums"
                  style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}
                >
                  {slotsCount}
                </span>
              </>
            ) : (
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex"
              >
                <ArrowRight size={12} weight="bold" color="#fff" />
              </motion.span>
            )}
          </span>
          {!hasCredits && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl animate-glow-breathe"
              style={{
                background:
                  'radial-gradient(circle at 50% 50%, rgba(224,63,106,0.55), transparent 65%)',
                filter: 'blur(22px)',
                opacity: 0.6,
                zIndex: -1,
              }}
            />
          )}
        </Link>

        <div className="flex items-center gap-1.5">
          {samples.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                haptic('light')
                onSelectIndex(i)
              }}
              aria-label={s.category}
              className="rounded-full no-tap-highlight"
              style={{
                width: i === activeIndex ? 22 : 6,
                height: 6,
                background: i === activeIndex ? 'var(--rose)' : 'var(--border-2)',
                transition: 'width 0.32s var(--ease-glide), background 0.32s ease',
              }}
            />
          ))}
        </div>
      </div>

      {!hasCredits && (
        <div className="px-5 mt-2.5">
          <p
            className="font-sans text-center"
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            <span style={{ color: 'var(--splash-green)' }}>● </span>
            Первое фото — бесплатно. Дальше от <strong style={{ color: '#fff', fontWeight: 700 }}>49₽</strong>.
          </p>
        </div>
      )}
    </section>
  )
}

export default memo(CinematicHeroBase)
