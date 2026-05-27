'use client'

import { motion } from 'framer-motion'
import { Camera, VideoCamera } from '@phosphor-icons/react'
import { haptic } from '@/lib/telegram'

export type GenerateMode = 'photo' | 'video'

interface Props {
  mode: GenerateMode
  onChange: (m: GenerateMode) => void
}

const MODES: Array<{ id: GenerateMode; label: string; icon: React.ElementType }> = [
  { id: 'photo', label: 'Фото', icon: Camera },
  { id: 'video', label: 'Видео', icon: VideoCamera },
]

export function ModeSwitch({ mode, onChange }: Props) {
  return (
    <div
      className="flex p-1 rounded-full self-start no-tap-highlight"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {MODES.map((m) => {
        const active = mode === m.id
        const Icon = m.icon
        const isVideo = m.id === 'video'
        const accent = isVideo ? 'var(--splash-cyan)' : 'var(--rose)'
        const accentBg = isVideo
          ? 'var(--splash-cyan-bg)'
          : 'rgba(224,63,106,0.18)'
        const accentBorder = isVideo
          ? 'rgba(63,212,224,0.35)'
          : 'var(--border-rose)'
        const accentShadow = isVideo
          ? '0 4px 16px -6px rgba(63,212,224,0.45)'
          : '0 4px 16px -6px rgba(224,63,106,0.4)'
        return (
          <button
            key={m.id}
            onClick={() => {
              haptic('light')
              onChange(m.id)
            }}
            className="relative px-4 py-1.5 inline-flex items-center gap-1.5 rounded-full no-tap-highlight"
          >
            {active && (
              <motion.span
                layoutId="mode-switch-tab"
                className="absolute inset-0 rounded-full"
                style={{
                  background: accentBg,
                  border: `1px solid ${accentBorder}`,
                  boxShadow: accentShadow,
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <Icon
              size={13}
              weight={active ? 'fill' : 'regular'}
              color={active ? accent : 'rgba(255,255,255,0.45)'}
              style={{ position: 'relative', zIndex: 1 }}
            />
            <span
              className="relative z-10 font-sans"
              style={{
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: active ? accent : 'rgba(255,255,255,0.5)',
              }}
            >
              {m.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
