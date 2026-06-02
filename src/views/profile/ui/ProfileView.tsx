'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ShieldCheck } from '@phosphor-icons/react'
import { DisplayTitle, Kicker } from '@shared/ui'
import { MemberCard } from '@widgets/member-card'
import { EASE_EDITORIAL } from '@shared/lib'
import { useUser } from '@entities/user'
import { BottomNav } from '@widgets/bottom-nav'
import { useContent } from '@entities/content'
import { haptic } from '@shared/lib'
import { ReferralCard } from './ReferralCard'
import { DrillDownList } from './DrillDownList'

export function ProfileView() {
  const { tgUser, me, wallet, isAdmin } = useUser()
  const titleProfile = useContent('page.title.profile')

  const slots = wallet?.prepaid_generations_remaining ?? 0
  const balanceMinor = wallet?.balance_minor ?? 0
  const refBalanceMinor = wallet?.referral_balance_minor ?? 0

  const initials =
    ((tgUser?.first_name?.[0] ?? '') + (tgUser?.last_name?.[0] ?? '')).toUpperCase() || 'V'
  const handle = tgUser?.username ? `@${tgUser.username}` : ''

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_EDITORIAL }}
        className="flex items-start justify-between gap-3 px-5 pb-5 pt-[max(env(safe-area-inset-top),20px)]"
      >
        <div className="flex flex-col gap-1">
          <Kicker tone="rose">Аккаунт</Kicker>
          <DisplayTitle size="md">{titleProfile}</DisplayTitle>
        </div>
        {isAdmin && (
          <Link
            href="/admin"
            onClick={() => haptic('light')}
            className="no-tap-highlight flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
            style={{
              background: 'var(--rose-dim)',
              border: '1px solid var(--border-rose)',
              color: 'var(--rose)',
            }}
          >
            <ShieldCheck size={12} weight="fill" />
            admin
          </Link>
        )}
      </motion.header>

      <MemberCard
        firstName={tgUser?.first_name ?? 'Гость'}
        lastName={tgUser?.last_name}
        handle={handle}
        avatarUrl={tgUser?.photo_url}
        initials={initials}
        slots={slots}
        balanceMajor={Math.round(balanceMinor / 100)}
        referralBalanceMajor={Math.round(refBalanceMinor / 100)}
      />

      <DrillDownList />

      {me?.referral_deep_link && (
        <ReferralCard
          link={me.referral_deep_link}
          code={me.referral_code ?? ''}
          earnedMinor={refBalanceMinor}
        />
      )}

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-8 px-5"
      >
        <div className="mb-4 h-px w-16" style={{ background: 'var(--border-2)' }} />
        <p
          className="font-sans"
          style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)' }}
        >
          история 72 часа
        </p>
      </motion.section>

      <BottomNav />
    </div>
  )
}
