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
          <p
            className="font-mono uppercase mb-1.5 inline-flex items-center gap-1.5"
            style={{ fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.45)' }}
          >
            <VideoCamera size={11} weight="fill" color="var(--rose)" />
            видео · 5–10 сек
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: 28,
              lineHeight: 1,
              letterSpacing: '-0.018em',
              color: 'var(--text)',
            }}
          >
            Сценарии
          </h2>
        </div>
        <Link
          href="/generate"
          onClick={() => haptic('light')}
          className="inline-flex items-center gap-1 text-[12px] font-medium pb-1"
          style={{ color: 'var(--rose)', borderBottom: '1px solid var(--rose)' }}
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
                  className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded font-mono"
                  style={{
                    background: 'rgba(13,11,16,0.78)',
                    color: '#fff',
                    fontSize: 10,
                    letterSpacing: '0.04em',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Lightning size={9} weight="fill" color="#FFD58A" />
                  {s.slots}
                </div>

                <div className="absolute left-2.5 right-2.5 bottom-2">
                  <p
                    className="font-medium leading-tight"
                    style={{ fontSize: 13, color: '#fff' }}
                  >
                    {s.label}
                  </p>
                  <p
                    className="font-mono uppercase mt-0.5"
                    style={{
                      fontSize: 9,
                      letterSpacing: '0.16em',
                      color: 'rgba(255,255,255,0.55)',
                    }}
                  >
                    {s.durationSec}с
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
