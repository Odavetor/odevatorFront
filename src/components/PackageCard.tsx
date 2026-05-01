'use client'

import { motion } from 'framer-motion'
import { Sparkle, Fire, Star } from '@phosphor-icons/react'
import type { Package } from '@/types'
import { haptic } from '@/lib/telegram'

interface Props {
  pkg: Package
  selected?: boolean
  onSelect: (id: string) => void
}

const ICONS = {
  '1': Sparkle,
  '10': Star,
  '25': Fire,
  '50': Fire,
}

export default function PackageCard({ pkg, selected, onSelect }: Props) {
  const Icon = ICONS[pkg.id as keyof typeof ICONS] ?? Sparkle

  return (
    <motion.button
      onClick={() => {
        haptic('light')
        onSelect(pkg.id)
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="relative w-full text-left rounded-2xl p-4 flex flex-col gap-3 overflow-hidden cursor-pointer"
      style={{
        background: selected
          ? 'linear-gradient(135deg, rgba(224,63,106,0.14) 0%, rgba(224,63,106,0.05) 100%)'
          : 'linear-gradient(135deg, #18181F 0%, #1F1F28 100%)',
        border: 'none',
        boxShadow: selected
          ? '0 0 0 1.5px #E03F6A, 0 0 24px rgba(224,63,106,0.45), inset 0 0 12px rgba(224,63,106,0.05)'
          : '0 0 0 1px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.05)',
        transition: 'all 0.25s ease',
      }}
    >
      {/* Popular badge */}
      {pkg.popular && (
        <div
          className="absolute top-3 right-3 text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(224,63,106,0.18)', color: '#e03f6a', border: '1px solid rgba(224,63,106,0.25)' }}
        >
          Топ
        </div>
      )}

      {/* Icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{
          background: selected ? 'rgba(224,63,106,0.18)' : 'rgba(255,255,255,0.05)',
          border: selected ? '1px solid rgba(224,63,106,0.25)' : '1px solid rgba(255,255,255,0.07)',
          transition: 'all 0.25s ease',
        }}
      >
        <Icon size={18} color={selected ? '#e03f6a' : '#7a4a5e'} weight="fill" />
      </div>

      {/* Count */}
      <div>
        <p className="font-mono text-gr-lg font-medium" style={{ color: selected ? '#e03f6a' : '#f2ece6' }}>
          {pkg.count}
        </p>
        <p className="text-cream-700 text-gr-2xs mt-0.5">
          {pkg.count === 1 ? 'обработка' : pkg.count < 5 ? 'обработки' : 'обработок'}
        </p>
      </div>

      {/* Price */}
      <div className="flex items-end gap-2 mt-auto">
        <span className="text-gr-md font-semibold text-cream-100">
          {pkg.price.toLocaleString('ru')} ₽
        </span>
        {pkg.savingsLabel && (
          <span className="text-xs text-cream-400 mb-0.5">{pkg.savingsLabel}</span>
        )}
      </div>
    </motion.button>
  )
}
