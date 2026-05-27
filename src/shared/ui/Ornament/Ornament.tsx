import { cn } from '@shared/lib'

type OrnamentVariant = 'star' | 'diamond' | 'fleur'

interface OrnamentProps {
  variant?: OrnamentVariant
  size?: number
  color?: string
  className?: string
}

export function Ornament({
  variant = 'star',
  size = 14,
  color = 'var(--gold)',
  className,
}: OrnamentProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn('inline-block flex-shrink-0', className)}
      aria-hidden
      fill={color}
    >
      {variant === 'star' && (
        <path d="M12 1.5l1.6 7.4 7.4 1.6-7.4 1.6L12 19.5l-1.6-7.4L3 10.5l7.4-1.6L12 1.5z" />
      )}
      {variant === 'diamond' && (
        <path d="M12 2l5 10-5 10-5-10 5-10zm0 4.5L9.2 12 12 17.5 14.8 12 12 6.5z" />
      )}
      {variant === 'fleur' && (
        <path d="M12 2c1.5 3 1.5 5 0 7 1.5-1.5 3.5-1.5 6 0-2.5 0-4 1-5 3 1 2 2.5 3 5 3-2.5 1.5-4.5 1.5-6 0 1.5 2 1.5 4 0 7-1.5-3-1.5-5 0-7-1.5 1.5-3.5 1.5-6 0 2.5 0 4-1 5-3-1-2-2.5-3-5-3 2.5-1.5 4.5-1.5 6 0-1.5-2-1.5-4 0-7z" />
      )}
    </svg>
  )
}
