'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Lightning, ShareNetwork, Wallet } from '@phosphor-icons/react'
import { CountUpNumber, DotPulse } from '@shared/ui'
import { EASE_EDITORIAL, intlLocale, tt, useLang } from '@shared/lib'

interface MemberCardProps {
  firstName: string
  lastName?: string
  handle: string
  avatarUrl?: string | null
  initials: string
  slots: number
  balanceMajor: number
  referralBalanceMajor: number
}

const fmtRub = (n: number) => `${Math.round(n).toLocaleString(intlLocale())} ₽`

export function MemberCard({
  firstName,
  lastName,
  handle,
  avatarUrl,
  initials,
  slots,
  balanceMajor,
  referralBalanceMajor,
}: MemberCardProps) {
  useLang()
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_EDITORIAL }}
      className="mx-5 flex flex-col gap-4"
    >
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <div
            className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl"
            style={{
              background:
                'linear-gradient(135deg, rgba(224,63,106,0.22) 0%, rgba(180,30,60,0.08) 100%)',
              border: '1px solid var(--border-rose)',
            }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span
                className="font-sans"
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  color: 'var(--rose)',
                }}
              >
                {initials}
              </span>
            )}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5">
            <DotPulse tone="rose" size={12} />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="truncate font-sans"
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
              color: 'var(--text)',
            }}
          >
            {firstName}
            {lastName ? ` ${lastName}` : ''}
          </p>
          {handle && (
            <p
              className="truncate font-sans"
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.45)',
                marginTop: 2,
              }}
            >
              {handle}
            </p>
          )}
        </div>
      </div>

      <div
        className="grid grid-cols-3 overflow-hidden rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border-1)',
        }}
      >
        <Cell
          icon={Lightning}
          label={tt({ ru: 'обработок', en: 'credits', de: 'Credits' })}
          accent="rose"
        >
          <CountUpNumber to={slots} duration={0.7} />
        </Cell>
        <Cell icon={Wallet} label={tt({ ru: 'баланс', en: 'balance', de: 'Guthaben' })} divided>
          <CountUpNumber to={balanceMajor} duration={1.0} format={fmtRub} />
        </Cell>
        <Cell
          icon={ShareNetwork}
          label={tt({ ru: 'рефер.', en: 'referral', de: 'Empfehl.' })}
          divided
          accent="rose"
        >
          <CountUpNumber to={referralBalanceMajor} duration={1.0} format={fmtRub} />
        </Cell>
      </div>
    </motion.section>
  )
}

interface CellProps {
  icon: React.ElementType
  label: string
  children: ReactNode
  accent?: 'rose' | 'muted'
  divided?: boolean
}

function Cell({ icon: Icon, label, children, accent = 'muted', divided }: CellProps) {
  const iconColor = accent === 'rose' ? 'var(--rose)' : 'rgba(255,255,255,0.55)'
  return (
    <div
      className="flex flex-col gap-1.5 px-3 py-3"
      style={{ borderLeft: divided ? '1px solid var(--border-1)' : 'none' }}
    >
      <div className="flex items-center gap-1.5">
        <Icon size={11} weight="fill" color={iconColor} />
        <span
          className="font-sans"
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '-0.005em',
          }}
        >
          {label}
        </span>
      </div>
      <p
        className="font-sans tabular-nums"
        style={{
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: '-0.022em',
          color: 'var(--text)',
          lineHeight: 1.1,
        }}
      >
        {children}
      </p>
    </div>
  )
}
