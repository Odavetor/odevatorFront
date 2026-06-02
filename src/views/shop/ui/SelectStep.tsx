'use client'

import { ArrowRight, WarningCircle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { PackCollection } from '@widgets/pack-collection'
import { PaymentMethodGrid } from '@widgets/payment-method-grid'
import { PremiumButton } from '@shared/ui'
import { EASE_EDITORIAL } from '@shared/lib'
import { fmtRub } from '@entities/pack'
import { useContent } from '@/lib/content'
import type { UseBuyPackResult } from '@features/buy-pack'
import { TierSwitch } from './TierSwitch'

interface Props {
  buy: UseBuyPackResult
}

export function SelectStep({ buy }: Props) {
  const stepPack = useContent('shop.step.pack')
  const stepMethod = useContent('shop.step.method')
  const buttonChoosePack = useContent('shop.button.choose_pack')
  const buttonChooseMethod = useContent('shop.button.choose_method')
  const buttonCreating = useContent('shop.button.creating')
  const tierStandardLabel = useContent('shop.tier.standard')
  const tierPromoLabel = useContent('shop.tier.promo')
  const errorPaymentInit = useContent('error.payment_init')
  const errorPaymentNoLink = useContent('error.payment_no_link')

  const enabled = !!buy.selectedOption && !!buy.selectedMethod
  const isPromo = buy.tier === 'weekly_promo'

  return (
    <motion.div
      key="select"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: EASE_EDITORIAL }}
      className="flex flex-col gap-6"
    >
      {buy.hasPromo && (
        <TierSwitch
          tier={buy.tier}
          onChange={buy.setTier}
          standardLabel={tierStandardLabel}
          promoLabel={tierPromoLabel}
        />
      )}

      <PackCollection
        options={buy.options}
        selectedQuantity={buy.selectedOption?.quantity ?? null}
        onSelect={buy.selectQuantity}
        tierLabel={stepPack}
        compareByQty={isPromo ? buy.standardPriceByQty : undefined}
      />

      <PaymentMethodGrid
        selected={buy.selectedMethod}
        onSelect={buy.selectMethod}
        stepLabel={stepMethod}
      />

      {buy.error && (
        <div
          className="rounded-xl px-3 py-2.5 flex items-start gap-2 text-xs"
          style={{
            background: 'rgba(180,30,60,0.12)',
            border: '1px solid rgba(180,30,60,0.22)',
            color: '#ff9aae',
          }}
        >
          <WarningCircle size={14} weight="fill" />
          <span>{buy.error}</span>
        </div>
      )}

      <PremiumButton
        tone={isPromo ? 'gold' : 'rose'}
        size="lg"
        glow={enabled}
        disabled={!enabled || buy.loading}
        onClick={() => buy.pay(errorPaymentInit, errorPaymentNoLink)}
        trailing={enabled && !buy.loading ? <ArrowRight size={16} weight="bold" /> : null}
      >
        {buy.loading
          ? buttonCreating
          : enabled && buy.selectedOption
            ? `Оплатить ${fmtRub(buy.selectedOption.price_minor)} ₽`
            : buy.selectedOption
              ? buttonChooseMethod
              : buttonChoosePack}
      </PremiumButton>
    </motion.div>
  )
}
