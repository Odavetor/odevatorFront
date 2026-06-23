'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from '@phosphor-icons/react'
import { DisplayTitle, Kicker } from '@shared/ui'
import { EASE_EDITORIAL, haptic, tt, useLang } from '@shared/lib'
import { BottomNav } from '@widgets/bottom-nav'
import { ReviewForm } from '@features/leave-review'

export function ReviewView() {
  useLang()
  const router = useRouter()

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_EDITORIAL }}
        className="flex items-center gap-3 px-5 pb-5 pt-[max(env(safe-area-inset-top),20px)]"
      >
        <button
          onClick={() => {
            haptic()
            router.back()
          }}
          className="no-tap-highlight flex h-9 w-9 items-center justify-center rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <ArrowLeft size={18} color="rgba(255,255,255,0.7)" weight="bold" />
        </button>
        <div className="flex flex-col gap-1">
          <Kicker tone="rose">{tt({ ru: 'Аккаунт', en: 'Account', de: 'Konto' })}</Kicker>
          <DisplayTitle size="md">
            {tt({ ru: 'Отзыв', en: 'Review', de: 'Bewertung' })}
          </DisplayTitle>
        </div>
      </motion.header>

      <div className="flex flex-1 flex-col gap-5 px-5 pb-6">
        <ReviewForm
          kind="user"
          title={tt({
            ru: 'Оцените сервис',
            en: 'Rate the service',
            de: 'Bewerten Sie den Service',
          })}
          subtitle={tt({
            ru: 'Ваша оценка помогает нам стать лучше.',
            en: 'Your rating helps us improve.',
            de: 'Ihre Bewertung hilft uns, besser zu werden.',
          })}
          placeholder={tt({
            ru: 'Что понравилось, а что можно улучшить? (необязательно)',
            en: 'What did you like, and what could be better? (optional)',
            de: 'Was hat Ihnen gefallen, was könnte besser sein? (optional)',
          })}
        />
      </div>

      <BottomNav />
    </div>
  )
}
