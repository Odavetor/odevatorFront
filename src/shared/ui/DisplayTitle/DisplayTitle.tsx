import type { CSSProperties, ElementType } from 'react'
import { cn } from '@shared/lib'

interface DisplayTitleProps {
  as?: ElementType
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  style?: CSSProperties
}

const SIZE: Record<NonNullable<DisplayTitleProps['size']>, CSSProperties> = {
  sm: { fontSize: 22, lineHeight: 1.08 },
  md: { fontSize: 28, lineHeight: 1.02 },
  lg: { fontSize: 36, lineHeight: 0.98 },
  xl: { fontSize: 44, lineHeight: 0.96 },
}

export function DisplayTitle({
  as: Tag = 'h1',
  children,
  size = 'md',
  className,
  style,
}: DisplayTitleProps) {
  return (
    <Tag
      className={cn('font-sans', className)}
      style={{
        fontWeight: 700,
        letterSpacing: '-0.025em',
        color: 'var(--text)',
        ...SIZE[size],
        ...style,
      }}
    >
      {children}
    </Tag>
  )
}
