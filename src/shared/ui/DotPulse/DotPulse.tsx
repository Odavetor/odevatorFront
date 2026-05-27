import type { CSSProperties } from 'react'
import { cn } from '@shared/lib'

type DotTone = 'rose' | 'gold' | 'green'

interface DotPulseProps {
  tone?: DotTone
  size?: number
  className?: string
}

const TONE_COLORS: Record<DotTone, { dot: string; halo: string; shadow: string }> = {
  rose: {
    dot: 'var(--rose)',
    halo: 'rgba(224,63,106,0.4)',
    shadow: '0 0 6px rgba(224,63,106,0.7)',
  },
  gold: {
    dot: 'var(--gold)',
    halo: 'rgba(201,150,106,0.4)',
    shadow: '0 0 6px rgba(201,150,106,0.6)',
  },
  green: {
    dot: '#5fd296',
    halo: 'rgba(95,210,150,0.4)',
    shadow: '0 0 6px rgba(95,210,150,0.65)',
  },
}

export function DotPulse({ tone = 'rose', size = 14, className }: DotPulseProps) {
  const tokens = TONE_COLORS[tone]
  const wrapStyle: CSSProperties = { width: size, height: size }
  const dotSize = Math.max(4, Math.round(size * 0.42))
  return (
    <span
      aria-hidden
      className={cn('relative inline-flex items-center justify-center', className)}
      style={wrapStyle}
    >
      <span
        className="absolute inset-0 rounded-full animate-glow-pulse"
        style={{ background: tokens.halo }}
      />
      <span
        className="relative rounded-full"
        style={{
          width: dotSize,
          height: dotSize,
          background: tokens.dot,
          boxShadow: tokens.shadow,
        }}
      />
    </span>
  )
}
