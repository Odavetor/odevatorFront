'use client'

import { isFeaturedQuantity } from '@entities/pack'
import { PackCard } from './PackCard'
import type { GenerationPackOption } from '@shared/api'

interface PackCollectionProps {
  options: GenerationPackOption[]
  selectedQuantity: number | null
  onSelect: (quantity: number) => void
  tierLabel: string
}

export function PackCollection({
  options,
  selectedQuantity,
  onSelect,
  tierLabel,
}: PackCollectionProps) {
  const unitBaseMinor = options[0]?.price_minor ?? 4900
  const sorted = [...options].sort((a, b) => {
    if (isFeaturedQuantity(a.quantity)) return -1
    if (isFeaturedQuantity(b.quantity)) return 1
    return a.quantity - b.quantity
  })

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2
          className="font-sans"
          style={{
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text)',
          }}
        >
          {tierLabel}
        </h2>
        <span
          className="font-sans"
          style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}
        >
          сколько фото берёшь?
        </span>
      </div>

      <div className="flex flex-col gap-2.5 pt-1">
        {sorted.map((opt, i) => (
          <PackCard
            key={opt.quantity}
            option={opt}
            index={i}
            unitBaseMinor={unitBaseMinor}
            active={selectedQuantity === opt.quantity}
            featured={isFeaturedQuantity(opt.quantity)}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  )
}
