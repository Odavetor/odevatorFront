'use client'

import { memo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { ArrowRight, Lightning, Sparkle } from '@phosphor-icons/react'
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

        {/* до badge — top-left */}
        <div
          className="absolute top-3 left-3 px-2 py-0.5 rounded font-mono uppercase z-20"
          style={{
            background: 'rgba(255,255,255,0.95)',
            color: 'rgba(13,11,16,0.92)',
            fontSize: 9,
            letterSpacing: '0.22em',
            boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
          }}
        >
          до
        </div>

        {/* после badge — top-right */}
        <div
          className="absolute top-3 right-3 px-2 py-0.5 rounded font-mono uppercase z-20"
          style={{
            background: 'var(--rose)',
            color: '#fff',
            fontSize: 9,
            letterSpacing: '0.22em',
            boxShadow: '0 2px 14px rgba(224,63,106,0.5)',
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

      {/* Active filter chip — burst out из диптиха, центр-низ */}
      <div className="relative flex justify-center px-5 z-20" style={{ marginTop: -26 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={sample.id + '-chip'}
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 360, damping: 26 }}
            className="flex items-center gap-2.5 rounded-full pl-2 pr-3.5 py-1.5"
            style={{
              background: 'linear-gradient(180deg, rgba(28,24,36,0.95) 0%, rgba(15,13,18,0.96) 100%)',
              border: '1px solid var(--border-rose)',
              backdropFilter: 'blur(20px) saturate(140%)',
              WebkitBackdropFilter: 'blur(20px) saturate(140%)',
              boxShadow:
                '0 10px 28px rgba(224,63,106,0.34), 0 4px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--rose-dim)', border: '1px solid var(--border-rose)' }}
            >
              <Sparkle size={12} weight="fill" color="var(--rose)" />
            </span>
            <div className="flex flex-col leading-none gap-0.5">
              <span
                className="font-mono uppercase"
                style={{ fontSize: 9, letterSpacing: '0.22em', color: 'var(--rose)' }}
              >
                {sample.category}
              </span>
              <span
                className="font-medium"
                style={{ fontSize: 14, color: '#fff', letterSpacing: '-0.01em' }}
              >
                {sample.label}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Headline + sub */}
      <div className="relative px-5 pt-6">
        <h1
          className="font-display"
          style={{
            fontSize: 42,
            fontWeight: 500,
            lineHeight: 0.97,
            letterSpacing: '-0.022em',
            color: 'var(--text)',
          }}
        >
          Меняй стиль,
          <br />
          тело, позу и фон
        </h1>

        <p
          className="mt-3 text-[13px] leading-relaxed max-w-[32ch]"
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          Загрузи фото, выбери фильтр —
          <br />
          ИИ выдаст результат за 30 секунд.
        </p>
      </div>

      {/* CTA + pagination */}
      <div className="px-5 mt-5 flex items-center justify-between gap-3">
        <Link
          href={ctaHref}
          onClick={() => haptic('medium')}
          className="relative inline-flex items-center gap-2 rounded-full pl-4 pr-1.5 py-1.5 active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.18), 0 8px 28px rgba(224,63,106,0.34)',
            transition: 'transform 0.18s ease',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <span className="text-sm font-medium" style={{ color: '#fff' }}>
            {ctaLabel}
          </span>
          <span
            className="flex items-center gap-1 rounded-full px-2 py-1 ml-1"
            style={{ background: 'rgba(255,255,255,0.18)' }}
          >
            {hasCredits ? (
              <>
                <Lightning size={11} weight="fill" color="#FFD58A" />
                <span className="font-mono" style={{ fontSize: 11, color: '#fff' }}>
                  {slotsCount}
                </span>
              </>
            ) : (
              <ArrowRight size={11} weight="bold" color="#fff" />
            )}
          </span>
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
              className="rounded-full"
              style={{
                width: i === activeIndex ? 22 : 5,
                height: 5,
                background: i === activeIndex ? 'var(--rose)' : 'var(--border-2)',
                transition: 'width 0.32s cubic-bezier(0.16,1,0.3,1), background 0.32s ease',
                WebkitTapHighlightColor: 'transparent',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default memo(CinematicHeroBase)
