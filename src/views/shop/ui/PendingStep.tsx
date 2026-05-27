'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Lightning } from '@phosphor-icons/react'
import { PAYMENT_METHODS_SPEC } from '@widgets/payment-method-grid'
import { PremiumButton } from '@shared/ui'
import { EASE_EDITORIAL } from '@shared/lib'
import { fmtRub } from '@entities/pack'
import { useContent } from '@/lib/content'
import type { UseBuyPackResult } from '@features/buy-pack'

interface Props {
  buy: UseBuyPackResult
}

export function PendingStep({ buy }: Props) {
  const pendingTitle = useContent('shop.pending.title')
  const pendingSubtitle = useContent('shop.pending.subtitle')
  const pendingReopen = useContent('shop.pending.reopen')
  const pendingConfirm = useContent('shop.pending.confirm')
  const pendingChecking = useContent('shop.pending.checking')
  const buttonCancel = useContent('button.cancel')

  if (!buy.selectedOption) return null
  const method = PAYMENT_METHODS_SPEC.find((m) => m.id === buy.selectedMethod)

  return (
    <motion.div
      key="pending"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: EASE_EDITORIAL }}
      className="flex flex-col gap-5"
    >
      <div
        className="rounded-3xl p-7 flex flex-col items-center gap-4 text-center"
        style={{
          background:
            'linear-gradient(180deg, rgba(31,25,41,0.8) 0%, rgba(13,11,16,0.8) 100%)',
          border: '1px solid var(--border-1)',
          boxShadow: 'var(--shadow-premium)',
        }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--rose-dim)', border: '1px solid var(--border-rose)' }}
        >
          <Lightning
            size={26}
            weight="duotone"
            color="var(--rose)"
            className="animate-breathe"
          />
        </div>
        <div>
          <p className="font-display mb-1.5" style={{ fontSize: 22, lineHeight: 1.1 }}>
            {pendingTitle}
          </p>
          <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {pendingSubtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="font-display"
            style={{ fontSize: 26, color: 'var(--rose)', letterSpacing: '-0.018em' }}
          >
            {fmtRub(buy.selectedOption.price_minor)} ₽
          </span>
          <span
            className="text-[11px] font-mono uppercase px-2 py-0.5 rounded"
            style={{
              letterSpacing: '0.16em',
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            {method?.label ?? ''}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {buy.redirectUrl && (
          <PremiumButton
            tone="rose"
            size="lg"
            onClick={buy.reopen}
            trailing={<ArrowRight size={15} weight="bold" />}
          >
            {pendingReopen}
          </PremiumButton>
        )}

        <PremiumButton
          tone="ghost"
          size="lg"
          onClick={() => void buy.check()}
          disabled={buy.loading}
        >
          {buy.loading ? pendingChecking : pendingConfirm}
        </PremiumButton>

        <button
          onClick={buy.reset}
          className="text-xs py-2 no-tap-highlight"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          {buttonCancel}
        </button>
      </div>
    </motion.div>
  )
}
