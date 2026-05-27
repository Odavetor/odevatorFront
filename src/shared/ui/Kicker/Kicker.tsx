import type { CSSProperties } from 'react'
import { cn } from '@shared/lib'

type KickerTone = 'muted' | 'gold' | 'rose'

interface KickerProps {
  children: React.ReactNode
  tone?: KickerTone
  className?: string
  style?: CSSProperties
}

const TONE_COLOR: Record<KickerTone, string> = {
  muted: 'rgba(255,255,255,0.5)',
  gold: 'var(--gold)',
  rose: 'var(--rose)',
}

export function Kicker({ children, tone = 'muted', className, style }: KickerProps) {
  return (
    <span
      className={cn('font-sans', className)}
      style={{
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '-0.005em',
        color: TONE_COLOR[tone],
        ...style,
      }}
    >
      {children}
    </span>
  )
}
