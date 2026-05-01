'use client'

import type { Package } from '@/types'
import { haptic } from '@/lib/telegram'

interface Props {
  pkg: Package
  selected?: boolean
  onSelect: (id: string) => void
}

function getCountWord(n: number): string {
  if (n === 1) return 'обработка'
  if (n < 5) return 'обработки'
  return 'обработок'
}

export default function PackageCard({ pkg, selected, onSelect }: Props) {
  return (
    <button
      onClick={() => {
        haptic('light')
        onSelect(pkg.id)
      }}
      className="relative w-full text-left flex items-end justify-between active:opacity-80"
      style={{
        paddingTop: 22,
        paddingBottom: 22,
        paddingLeft: 20,
        paddingRight: 20,
        background: selected ? 'var(--rose-soft)' : 'transparent',
        transition: 'background 0.22s ease',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {selected && (
        <div
          className="absolute left-0 top-0 bottom-0"
          style={{ width: 2, background: 'var(--rose)' }}
        />
      )}

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline gap-3">
          <span
            className="font-display leading-none"
            style={{
              fontSize: 56,
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: selected ? 'var(--text)' : 'var(--text-2)',
              transition: 'color 0.22s ease',
            }}
          >
            {pkg.count}
          </span>
          {pkg.popular && (
            <span
              className="font-mono uppercase"
              style={{
                fontSize: 9,
                letterSpacing: '0.22em',
                color: 'var(--rose)',
              }}
            >
              Топ
            </span>
          )}
        </div>
        <span
          className="uppercase font-mono"
          style={{
            fontSize: 10,
            letterSpacing: '0.16em',
            color: 'var(--text-3)',
          }}
        >
          {getCountWord(pkg.count)}
        </span>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span
          className="font-mono"
          style={{
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: '-0.01em',
            color: selected ? 'var(--text)' : 'var(--text-2)',
            transition: 'color 0.22s ease',
          }}
        >
          {pkg.price.toLocaleString('ru')} ₽
        </span>
        {pkg.savingsLabel && (
          <span
            className="font-mono"
            style={{
              fontSize: 11,
              color: 'var(--rose)',
            }}
          >
            {pkg.savingsLabel}
          </span>
        )}
      </div>
    </button>
  )
}
