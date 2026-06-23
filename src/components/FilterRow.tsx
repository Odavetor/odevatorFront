'use client'

import { motion } from 'framer-motion'
import { pickLabel, useLang } from '@shared/lib'
import type { FilterOption, FilterCategory } from '@/data/generate-options'

interface Props {
  category: FilterCategory
  selected: string | null
  onSelect: (option: FilterOption) => void
}

// Padding следует golden ratio: py≈7px, px≈11px → px/py ≈ 1.57 ≈ φ
const CHIP_STYLE = { paddingTop: 7, paddingBottom: 7, paddingLeft: 11, paddingRight: 11 }

export default function FilterRow({ category, selected, onSelect }: Props) {
  useLang() // re-render labels when the active language changes
  return (
    /* Bleed: выходим за px-5 (20px) родителя чтобы чипы не обрезались при скролле */
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
      {category.options.map((opt, i) => {
        const active = selected === opt.id
        return (
          <motion.button
            key={opt.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i, 6) * 0.025, duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => onSelect(opt)}
            whileTap={{ scale: 0.94 }}
            className="flex-shrink-0 rounded-full text-sm font-medium"
            style={{
              ...CHIP_STYLE,
              background: active ? 'var(--rose-dim)' : 'rgba(255,255,255,0.04)',
              boxShadow: active
                ? 'inset 0 0 0 1.5px var(--rose)'
                : 'inset 0 0 0 1px var(--border-2)',
              color: active ? 'var(--rose)' : 'rgba(255,255,255,0.6)',
              transition: 'all 0.18s ease',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {pickLabel(opt.label, opt.label_en, opt.label_de)}
          </motion.button>
        )
      })}
    </div>
  )
}
