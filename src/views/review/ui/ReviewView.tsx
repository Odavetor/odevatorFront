'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from '@phosphor-icons/react'
import { DisplayTitle, Kicker } from '@shared/ui'
import { EASE_EDITORIAL, haptic } from '@shared/lib'
import { BottomNav } from '@widgets/bottom-nav'
import { ReviewForm } from '@features/leave-review'

export function ReviewView() {
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
          <Kicker tone="rose">Аккаунт</Kicker>
          <DisplayTitle size="md">Отзыв</DisplayTitle>
        </div>
      </motion.header>

      <div className="flex flex-1 flex-col gap-5 px-5 pb-6">
        <ReviewForm
          kind="user"
          title="Оцените сервис"
          subtitle="Ваша оценка помогает нам стать лучше."
          placeholder="Что понравилось, а что можно улучшить? (необязательно)"
        />
      </div>

      <BottomNav />
    </div>
  )
}
