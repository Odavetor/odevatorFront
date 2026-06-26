'use client'

import { ArrowRight, WarningCircle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { PackCollection } from '@widgets/pack-collection'
import { PaymentMethodGrid } from '@widgets/payment-method-grid'
import { PremiumButton } from '@shared/ui'
import { EASE_EDITORIAL, tt, useLang, useFx, formatPrice } from '@shared/lib'
import { useContent } from '@/lib/content'
import type { UseBuyPackResult } from '@features/buy-pack'

interface Props {
  buy: UseBuyPackResult
}

export function SelectStep({ buy }: Props) {
  useLang()
  useFx()
  const stepPack = useContent('shop.step.pack')
  const stepMethod = useContent('shop.step.method')
  const buttonChoosePack = useContent('shop.button.choose_pack')
  const buttonChooseMethod = useContent('shop.button.choose_method')
  const buttonCreating = useContent('shop.button.creating')
  const errorPaymentInit = useContent('error.payment_init')
  const errorPaymentNoLink = useContent('error.payment_no_link')

  const enabled = !!buy.selectedOption && !!buy.selectedMethod

  return (
    <motion.div
      key="select"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: EASE_EDITORIAL }}
      className="flex flex-col gap-6"
    >
      <PackCollection
        options={buy.options}
        selectedQuantity={buy.selectedOption?.quantity ?? null}
        onSelect={buy.selectQuantity}
        tierLabel={stepPack}
      />

      <PaymentMethodGrid
        selected={buy.selectedMethod}
        onSelect={buy.selectMethod}
        stepLabel={stepMethod}
      />

      {buy.error && (
        <div
          className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs"
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
        tone="rose"
        size="lg"
        glow={enabled}
        disabled={!enabled || buy.loading}
        onClick={() => buy.pay(errorPaymentInit, errorPaymentNoLink)}
        trailing={enabled && !buy.loading ? <ArrowRight size={16} weight="bold" /> : null}
      >
        {buy.loading
          ? buttonCreating
          : enabled && buy.selectedOption
            ? `${tt({ ru: 'Оплатить', en: 'Pay', de: 'Bezahlen' })} ${formatPrice(
                buy.selectedOption.discount_price_minor != null &&
                  buy.selectedOption.discount_price_minor < buy.selectedOption.price_minor
                  ? buy.selectedOption.discount_price_minor
                  : buy.selectedOption.price_minor,
              )}`
            : buy.selectedOption
              ? buttonChooseMethod
              : buttonChoosePack}
      </PremiumButton>
    </motion.div>
  )
}
