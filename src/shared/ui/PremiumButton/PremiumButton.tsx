'use client'

import type { CSSProperties, ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@shared/lib'

type ButtonTone = 'rose' | 'gold' | 'ghost' | 'ink'
type ButtonSize = 'sm' | 'md' | 'lg'

interface PremiumButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  tone?: ButtonTone
  size?: ButtonSize
  glow?: boolean
  leading?: ReactNode
  trailing?: ReactNode
  children: ReactNode
}

const SIZE_STYLE: Record<ButtonSize, CSSProperties> = {
  sm: { padding: '10px 16px', fontSize: 13, borderRadius: 999 },
  md: { padding: '14px 18px', fontSize: 15, borderRadius: 16 },
  lg: { padding: '16px 20px', fontSize: 16, borderRadius: 18 },
}

function getToneStyle(tone: ButtonTone, enabled: boolean): CSSProperties {
  if (!enabled) {
    return {
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid var(--border-1)',
      color: 'rgba(255,255,255,0.28)',
      boxShadow: 'none',
    }
  }
  switch (tone) {
    case 'rose':
      return {
        background: 'linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.18), 0 8px 28px rgba(224,63,106,0.34)',
        color: '#fff',
        border: 'none',
      }
    case 'gold':
      return {
        background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-deep) 100%)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.22), 0 10px 32px rgba(201,150,106,0.34)',
        color: '#1a1410',
        border: 'none',
      }
    case 'ink':
      return {
        background: 'rgba(18,18,24,0.92)',
        border: '1px solid var(--border-2)',
        color: 'rgba(255,255,255,0.92)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }
    case 'ghost':
    default:
      return {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--border-1)',
        color: 'rgba(255,255,255,0.85)',
        boxShadow: 'none',
      }
  }
}

export function PremiumButton({
  tone = 'rose',
  size = 'md',
  glow = false,
  leading,
  trailing,
  disabled,
  className,
  style,
  children,
  ...rest
}: PremiumButtonProps) {
  const enabled = !disabled
  const toneStyle = getToneStyle(tone, enabled)
  return (
    <motion.button
      whileTap={enabled ? { scale: 0.97 } : undefined}
      disabled={disabled}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 font-medium no-tap-highlight',
        'transition-all ease-glide',
        className,
      )}
      style={{ ...SIZE_STYLE[size], ...toneStyle, ...style }}
      {...rest}
    >
      {glow && enabled && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] animate-glow-breathe"
          style={{
            background:
              tone === 'gold'
                ? 'radial-gradient(circle at 50% 50%, rgba(201,150,106,0.4), transparent 65%)'
                : 'radial-gradient(circle at 50% 50%, rgba(224,63,106,0.45), transparent 65%)',
            filter: 'blur(20px)',
            opacity: 0.5,
            zIndex: -1,
          }}
        />
      )}
      {enabled && (
        <span
          aria-hidden
          className="absolute top-0 left-6 right-6 h-px pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
          }}
        />
      )}
      {leading}
      <span className="relative z-10">{children}</span>
      {trailing}
    </motion.button>
  )
}
