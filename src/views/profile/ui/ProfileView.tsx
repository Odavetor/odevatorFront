'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ShieldCheck, ArrowRight } from '@phosphor-icons/react'
import { DisplayTitle, Kicker, LanguageSwitcher } from '@shared/ui'
import { MemberCard } from '@widgets/member-card'
import { EASE_EDITORIAL, tt } from '@shared/lib'
import { fetchAffiliateCode } from '@/lib/referral'
import { useUser } from '@entities/user'
import { BottomNav } from '@widgets/bottom-nav'
import { useContent } from '@entities/content'
import { haptic } from '@shared/lib'
import { ReferralCard } from './ReferralCard'
import { DrillDownList } from './DrillDownList'
import { ContactsCard } from './ContactsCard'
import { LegalLinks } from './LegalLinks'

export function ProfileView() {
  const { tgUser, me, wallet, isAdmin } = useUser()
  const titleProfile = useContent('page.title.profile')

  const slots = wallet?.prepaid_generations_remaining ?? 0
  const balanceMinor = wallet?.balance_minor ?? 0
  const refBalanceMinor = wallet?.referral_balance_minor ?? 0

  const initials =
    ((tgUser?.first_name?.[0] ?? '') + (tgUser?.last_name?.[0] ?? '')).toUpperCase() || 'V'
  const handle = tgUser?.username ? `@${tgUser.username}` : ''

  const [affCode, setAffCode] = useState<string | null>(null)
  useEffect(() => {
    fetchAffiliateCode()
      .then((r) => setAffCode(r.code || null))
      .catch(() => {})
  }, [])
  const affiliateLink =
    me?.referral_deep_link && affCode
      ? `${me.referral_deep_link.split('?')[0]}?start=_tgr_${affCode}`
      : ''

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_EDITORIAL }}
        className="flex items-start justify-between gap-3 px-5 pb-5 pt-[max(env(safe-area-inset-top),20px)]"
      >
        <div className="flex flex-col gap-1">
          <Kicker tone="rose">{tt({ ru: 'Аккаунт', en: 'Account', de: 'Konto' })}</Kicker>
          <DisplayTitle size="md">{titleProfile}</DisplayTitle>
        </div>
        <div className="flex flex-col items-end gap-2">
          <LanguageSwitcher />
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
        </div>
      </motion.header>

      <MemberCard
        firstName={tgUser?.first_name ?? tt({ ru: 'Гость', en: 'Guest', de: 'Gast' })}
        lastName={tgUser?.last_name}
        handle={handle}
        avatarUrl={tgUser?.photo_url}
        initials={initials}
        slots={slots}
        balanceMajor={Math.round(balanceMinor / 100)}
        referralBalanceMajor={Math.round(refBalanceMinor / 100)}
      />

      <DrillDownList />

      {affiliateLink ? (
        <ReferralCard
          link={affiliateLink}
          code={affCode ?? ''}
          earnedMinor={refBalanceMinor}
        />
      ) : (
        <Link
          href="/profile/referrals"
          onClick={() => haptic('light')}
          className="no-tap-highlight mx-5 mt-4 flex items-center gap-3 rounded-2xl px-4 py-4"
          style={{
            background:
              'linear-gradient(135deg, rgba(224,63,106,0.18) 0%, rgba(31,25,41,0.6) 100%)',
            border: '1px solid var(--border-rose)',
          }}
        >
          <div className="flex flex-1 flex-col gap-0.5">
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>
              {tt({
                ru: 'Привяжите партнёрскую ссылку',
                en: 'Bind your affiliate link',
                de: 'Partnerlink verknüpfen',
              })}
            </span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
              {tt({
                ru: 'Чтобы получать 70% с приглашённых',
                en: 'To earn 70% from your referrals',
                de: 'Um 70% von Empfehlungen zu verdienen',
              })}
            </span>
          </div>
          <ArrowRight size={18} color="var(--rose)" weight="bold" />
        </Link>
      )}

      <ContactsCard />

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
          {tt({ ru: 'история 72 часа', en: 'history kept 72 h', de: 'Verlauf 72 Std.' })}
        </p>
      </motion.section>

      <LegalLinks />

      <BottomNav />
    </div>
  )
}
