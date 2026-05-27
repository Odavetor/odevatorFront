import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@shared/lib'

type SurfaceVariant = 'plain' | 'premium' | 'gold' | 'glass'

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SurfaceVariant
  radius?: number
  children: ReactNode
}

const VARIANT_CLASS: Record<SurfaceVariant, string> = {
  plain: 'surface',
  premium: 'surface-premium',
  gold: 'surface-gold',
  glass: '',
}

const GLASS_STYLE: CSSProperties = {
  background:
    'linear-gradient(180deg, rgba(28,24,36,0.78) 0%, rgba(15,13,18,0.92) 100%)',
  border: '1px solid var(--border-2)',
  backdropFilter: 'blur(20px) saturate(140%)',
  WebkitBackdropFilter: 'blur(20px) saturate(140%)',
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 36px rgba(0,0,0,0.45)',
}

export function Surface({
  variant = 'plain',
  radius = 20,
  className,
  style,
  children,
  ...rest
}: SurfaceProps) {
  const variantStyle = variant === 'glass' ? GLASS_STYLE : undefined
  return (
    <div
      className={cn('relative', VARIANT_CLASS[variant], className)}
      style={{ borderRadius: radius, ...variantStyle, ...style }}
      {...rest}
    >
      {children}
    </div>
  )
}
