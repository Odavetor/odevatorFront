'use client'

import { memo, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Lightning, VideoCamera } from '@phosphor-icons/react'
import { haptic } from '@/lib/telegram'
import { fetchVideoCatalog } from '@/lib/catalog'
import { VIDEO_SCENARIOS } from '@/data/generate-options'
import type { VideoScenario } from '@/data/generate-options'

function ScenariosStripBase() {
  const [scenarios, setScenarios] = useState<VideoScenario[]>(VIDEO_SCENARIOS)

  useEffect(() => {
    let cancelled = false
    fetchVideoCatalog()
      .then((d) => {
        if (cancelled || !d.scenarios?.length) return
        setScenarios(d.scenarios)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="mt-10">
      <div className="px-5 mb-4 flex items-end justify-between">
        <div>
          <h2
            className="font-sans inline-flex items-center gap-2"
            style={{
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1.05,
              color: 'var(--text)',
            }}
          >
            <VideoCamera size={20} weight="fill" color="var(--rose)" />
            Сценарии
          </h2>
          <p
            className="font-sans mt-1"
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            видео 5–10 секунд
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
          Все {scenarios.length}
          <ArrowRight size={11} weight="bold" />
        </Link>
      </div>

      <div
        className="flex gap-2.5 overflow-x-auto"
        style={{
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          paddingLeft: 20,
          paddingRight: 20,
          paddingBottom: 4,
        }}
      >
        {scenarios.slice(0, 8).map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i, 6) * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex-shrink-0"
          >
            <Link
              href="/generate"
              onClick={() => haptic('light')}
              className="block relative w-[148px]"
            >
              <div
                className="relative w-full overflow-hidden rounded-2xl"
                style={{
                  aspectRatio: '1.45 / 1',
                  border: '1px solid var(--border-1)',
                }}
              >
                <Image
                  src={s.thumbnail}
                  alt={s.label}
                  fill
                  sizes="148px"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(13,11,16,0.85) 0%, rgba(13,11,16,0.2) 50%, transparent 80%)',
                  }}
                />

                {/* Slot cost — top right */}
                <div
                  className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md font-sans tabular-nums"
                  style={{
                    background: 'rgba(13,11,16,0.78)',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '-0.005em',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Lightning size={10} weight="fill" color="#fff" />
                  {s.slots}
                </div>

                <div className="absolute left-2.5 right-2.5 bottom-2">
                  <p
                    className="font-sans"
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: '-0.015em',
                      color: '#fff',
                      lineHeight: 1.05,
                    }}
                  >
                    {s.label}
                  </p>
                  <p
                    className="font-sans tabular-nums mt-0.5"
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.6)',
                    }}
                  >
                    {s.durationSec} сек
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default memo(ScenariosStripBase)
