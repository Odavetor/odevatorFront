'use client'

import { motion } from 'framer-motion'
import { Play } from '@phosphor-icons/react'
import { haptic } from '@/lib/telegram'
import type { VideoScenario } from '@/data/generate-options'

interface Props {
  scenarios: VideoScenario[]
  onSelectScenario: (id: string) => void
}

export default function VideoScenarioGrid({ scenarios, onSelectScenario }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {scenarios.map((s, i) => (
        <ScenarioCard key={s.id} scenario={s} index={i} onSelect={onSelectScenario} />
      ))}
    </div>
  )
}

function ScenarioCard({
  scenario,
  index,
  onSelect,
}: {
  scenario: VideoScenario
  index: number
  onSelect: (id: string) => void
}) {
  const sourcePhoto = `https://picsum.photos/seed/face-${scenario.id}/80/106`

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.055, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-2"
    >
      <motion.button
        onClick={() => {
          haptic('light')
          onSelect(scenario.id)
        }}
        whileTap={{ scale: 0.955 }}
        className="relative w-full rounded-2xl overflow-hidden"
        style={{
          aspectRatio: '3/4',
          WebkitTapHighlightColor: 'transparent',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.07), 0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        {/* Main thumbnail (result preview) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={scenario.thumbnail}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Bottom vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(13,13,15,0.6) 0%, rgba(13,13,15,0.1) 40%, transparent 65%)',
          }}
        />

        {/* Source photo — top-left pip */}
        <div
          className="absolute top-2 left-2 rounded-lg overflow-hidden"
          style={{
            width: 38,
            height: 50,
            border: '1.5px solid rgba(255,255,255,0.22)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.6)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sourcePhoto} alt="" className="w-full h-full object-cover" />
        </div>

        {/* Play badge — bottom right */}
        <div
          className="absolute bottom-2.5 right-2.5 flex items-center justify-center rounded-full"
          style={{
            width: 28,
            height: 28,
            background: 'rgba(13,13,15,0.55)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.18)',
          }}
        >
          <Play size={11} weight="fill" color="rgba(255,255,255,0.9)" />
        </div>
      </motion.button>

      {/* Label below card */}
      <p
        className="text-center text-xs font-medium truncate px-1"
        style={{ color: 'rgba(255,255,255,0.62)' }}
      >
        {scenario.label}
      </p>
    </motion.div>
  )
}
