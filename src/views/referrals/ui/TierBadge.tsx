'use client'

import { motion } from 'framer-motion'
import { Crown } from '@phosphor-icons/react'
import { EASE_EDITORIAL, tt, useLang } from '@shared/lib'
import type { ReferralTier } from '@/lib/referral'
import { localizeTier } from '../lib/tiers'

export function TierBadge({ tier }: { tier: ReferralTier }) {
  useLang()
  const isMax = !tier.next_name
  const remaining = Math.max(tier.next_at - tier.paid_referrals, 0)

  return (
    <section
      className="flex flex-col gap-3 rounded-2xl px-4 py-3.5"
      style={{
        background: 'linear-gradient(135deg, rgba(201,150,106,0.14) 0%, rgba(15,13,18,0.5) 100%)',
        border: '1px solid rgba(201,150,106,0.28)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              background: 'rgba(201,150,106,0.18)',
              border: '1px solid rgba(201,150,106,0.3)',
            }}
          >
            <Crown size={18} color="#E0B486" weight="fill" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {tt({ ru: 'ваш уровень', en: 'your tier', de: 'deine Stufe' })}
            </span>
            <span className="font-sans text-[16px] font-extrabold" style={{ color: '#E8C9A4' }}>
              {localizeTier(tier.name)}
            </span>
          </div>
        </div>
        <span className="text-[11px] tabular-nums" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {tt({
            ru: `${tier.paid_referrals} оплат`,
            en: `${tier.paid_referrals} paid`,
            de: `${tier.paid_referrals} Käufe`,
          })}
        </span>
      </div>

      {!isMax && (
        <div className="flex flex-col gap-1.5">
          <div
            className="h-2 overflow-hidden rounded-full"
            style={{ background: 'rgba(0,0,0,0.3)' }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(Math.max(tier.progress, 0), 1) * 100}%` }}
              transition={{ duration: 0.8, ease: EASE_EDITORIAL }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #C9966A, #E8C9A4)' }}
            />
          </div>
          <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {tt({
              ru: `ещё ${remaining} оплат до уровня «${localizeTier(tier.next_name)}»`,
              en: `${remaining} more paid to reach tier «${localizeTier(tier.next_name)}»`,
              de: `noch ${remaining} Käufe bis zur Stufe «${localizeTier(tier.next_name)}»`,
            })}
          </span>
        </div>
      )}
      {isMax && (
        <span className="text-[11px]" style={{ color: 'rgba(232,201,164,0.8)' }}>
          {tt({
            ru: 'максимальный уровень — вы в числе лучших партнёров',
            en: 'top tier — you are among the best partners',
            de: 'höchste Stufe — du gehörst zu den besten Partnern',
          })}
        </span>
      )}
    </section>
  )
}
