'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { PremiumButton } from '@shared/ui'
import { useContent } from '@/lib/content'

interface Props {
  open: boolean
}

export function NoCreditsAlert({ open }: Props) {
  const router = useRouter()
  const noCreditsText = useContent('generate.no_credits')
  const buttonBuy = useContent('button.buy')

  if (!open) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl p-4 flex items-center justify-between gap-3"
      style={{
        background: 'rgba(180,30,60,0.12)',
        border: '1px solid rgba(180,30,60,0.22)',
        boxShadow: '0 8px 24px -10px rgba(180,30,60,0.4)',
      }}
    >
      <p className="text-red-300 text-sm">{noCreditsText}</p>
      <PremiumButton tone="rose" size="sm" onClick={() => router.push('/shop')}>
        {buttonBuy}
      </PremiumButton>
    </motion.div>
  )
}
