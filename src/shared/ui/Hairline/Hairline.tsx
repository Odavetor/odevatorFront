import { cn } from '@shared/lib'

type HairlineVariant = 'gold' | 'rose' | 'soft'

interface HairlineProps {
  variant?: HairlineVariant
  width?: number | string
  className?: string
}

const VARIANT_CLASS: Record<HairlineVariant, string> = {
  gold: 'hairline-gold',
  rose: 'hairline-rose',
  soft: 'hairline-soft',
}

export function Hairline({ variant = 'soft', width, className }: HairlineProps) {
  return (
    <div
      aria-hidden
      className={cn(VARIANT_CLASS[variant], className)}
      style={width !== undefined ? { width } : undefined}
    />
  )
}
