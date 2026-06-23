'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { haptic } from '@/lib/telegram'
import { pickLabel, useLang } from '@shared/lib'
import { SparkleBurst } from '@shared/ui'
import type { FilterCategory, FilterOption } from '@/data/generate-options'

interface Props {
  categories: FilterCategory[]
  pickedCategoryId: string | null
  pickedOptionId: string | null
  onSelectOption: (categoryId: string, opt: FilterOption) => void
}

export function CategoryStepper({
  categories,
  pickedCategoryId,
  pickedOptionId,
  onSelectOption,
}: Props) {
  const [burstId, setBurstId] = useState<string | null>(null)
  const prevPickedRef = useRef<string | null>(pickedOptionId)
  useLang() // re-render labels when the active language changes

  useEffect(() => {
    if (pickedOptionId && pickedOptionId !== prevPickedRef.current) {
      setBurstId(pickedOptionId)
      prevPickedRef.current = pickedOptionId
      const t = setTimeout(() => setBurstId(null), 650)
      return () => clearTimeout(t)
    }
    prevPickedRef.current = pickedOptionId
  }, [pickedOptionId])

  return (
    <div className="flex flex-col gap-3">
      {categories.map((cat) => {
        const rowHasPick = pickedCategoryId === cat.id
        return (
          <div key={cat.id} className="flex flex-col gap-2">
            <span
              className="inline-flex items-center gap-2 px-1 font-sans"
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '-0.015em',
                color: rowHasPick ? 'var(--text)' : 'rgba(255,255,255,0.55)',
                transition: 'color 0.18s var(--ease-glide)',
              }}
            >
              {pickLabel(cat.label, cat.label_en, cat.label_de)}
              {rowHasPick && (
                <span
                  className="rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    background: 'var(--rose)',
                    boxShadow: '0 0 8px rgba(224,63,106,0.7)',
                  }}
                />
              )}
            </span>

            <div
              className="flex gap-2 overflow-x-auto"
              style={{
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch',
                marginLeft: -20,
                marginRight: -20,
                paddingLeft: 20,
                paddingRight: 20,
                paddingBottom: 4,
              }}
            >
              {cat.options.map((opt) => {
                const active = rowHasPick && opt.id === pickedOptionId
                const bursting = burstId === opt.id
                return (
                  <motion.button
                    key={opt.id}
                    onClick={() => {
                      haptic('light')
                      onSelectOption(cat.id, opt)
                    }}
                    whileTap={{ scale: 0.94 }}
                    animate={bursting ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                    transition={{ duration: 0.42, ease: [0.34, 1.56, 0.64, 1] }}
                    className="no-tap-highlight relative flex-shrink-0 rounded-full font-sans"
                    style={{
                      padding: '8px 14px',
                      fontSize: 13,
                      fontWeight: active ? 700 : 600,
                      letterSpacing: '-0.01em',
                      background: active ? 'var(--rose-dim)' : 'rgba(255,255,255,0.04)',
                      boxShadow: active
                        ? 'inset 0 0 0 1.5px var(--rose), 0 6px 18px -6px rgba(224,63,106,0.5)'
                        : 'inset 0 0 0 1px var(--border-2)',
                      color: active ? 'var(--rose)' : 'rgba(255,255,255,0.65)',
                      transition:
                        'background 0.18s var(--ease-glide), box-shadow 0.18s var(--ease-glide), color 0.18s var(--ease-glide)',
                    }}
                  >
                    {pickLabel(opt.label, opt.label_en, opt.label_de)}
                    {bursting && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute left-1/2 top-1/2"
                        style={{ width: 0, height: 0 }}
                      >
                        <SparkleBurst count={5} radius={26} color="var(--rose)" />
                      </span>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
