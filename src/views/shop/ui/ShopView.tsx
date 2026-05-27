'use client'

import { AnimatePresence } from 'framer-motion'
import { useUser } from '@entities/user'
import { BottomNav } from '@widgets/bottom-nav'
import { useContent } from '@entities/content'
import { useBuyPack } from '@features/buy-pack'
import { ShopHeader } from './ShopHeader'
import { SelectStep } from './SelectStep'
import { PendingStep } from './PendingStep'
import { SuccessStep } from './SuccessStep'

export function ShopView() {
  const { wallet } = useUser()
  const buy = useBuyPack()

  const titleKicker = useContent('page.title.shop_kicker')
  const titleShop = useContent('page.title.shop')

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <ShopHeader
        kicker={titleKicker}
        title={titleShop}
        slots={wallet?.prepaid_generations_remaining ?? 0}
      />

      <div className="flex-1 px-5 pb-6">
        <AnimatePresence mode="wait">
          {buy.step === 'select' && <SelectStep buy={buy} />}
          {buy.step === 'pending' && <PendingStep buy={buy} />}
          {buy.step === 'success' && <SuccessStep buy={buy} />}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  )
}
