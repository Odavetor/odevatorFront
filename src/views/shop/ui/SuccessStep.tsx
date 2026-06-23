'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle } from '@phosphor-icons/react'
import { DisplayTitle, PremiumButton, SparkleBurst } from '@shared/ui'
import { generationsPluralRu } from '@entities/pack'
import { EASE_EDITORIAL, haptic, tt, useLang } from '@shared/lib'
import { useContent } from '@entities/content'
import type { UseBuyPackResult } from '@features/buy-pack'

interface Props {
  buy: UseBuyPackResult
}

export function SuccessStep({ buy }: Props) {
  useLang()
  const router = useRouter()
  const successTitle = useContent('shop.success.title')
  const buttonBuyMore = useContent('button.buy_more')
  const buttonCreatePhoto = useContent('button.create_photo')

  if (!buy.selectedOption) return null

  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: EASE_EDITORIAL }}
      className="flex flex-col items-center gap-6 py-10"
    >
      <div className="relative">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.08, type: 'spring', stiffness: 380, damping: 22 }}
          className="relative flex h-20 w-20 items-center justify-center rounded-full"
          style={{
            background: 'linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%)',
            boxShadow: 'var(--shadow-neon-cta)',
          }}
        >
          <CheckCircle size={42} color="#fff" weight="fill" />
        </motion.div>
        <SparkleBurst count={12} radius={64} color="#fff" />
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <DisplayTitle size="lg">{successTitle}</DisplayTitle>
        <p
          className="font-sans"
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          +{buy.selectedOption.quantity}{' '}
          {tt({
            ru: `${generationsPluralRu(buy.selectedOption.quantity)} зачислено`,
            en: `${buy.selectedOption.quantity === 1 ? 'generation' : 'generations'} credited`,
            de: `${buy.selectedOption.quantity === 1 ? 'Generierung' : 'Generierungen'} gutgeschrieben`,
          })}
        </p>
      </div>

      <div className="flex w-full flex-col gap-2">
        <PremiumButton
          tone="rose"
          size="lg"
          glow
          onClick={() => {
            haptic('medium')
            router.push('/generate')
          }}
          trailing={<ArrowRight size={16} weight="bold" />}
        >
          {buttonCreatePhoto}
        </PremiumButton>
        <PremiumButton tone="ghost" size="md" onClick={buy.reset}>
          {buttonBuyMore}
        </PremiumButton>
      </div>
    </motion.div>
  )
}
