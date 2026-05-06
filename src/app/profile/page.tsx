'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  Copy,
  IdentificationCard,
  Lightning,
  ShareNetwork,
  ShieldCheck,
  Sparkle,
} from '@phosphor-icons/react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import { useUser } from '@/components/TelegramProvider'
import { haptic, hapticNotify } from '@/lib/telegram'

const fmtRub = (minor: number) => Math.round(minor / 100).toLocaleString('ru')

export default function ProfilePage() {
  const { tgUser, me, wallet, isAdmin } = useUser()

  const memberSince = me?.created_at
    ? new Date(me.created_at).toLocaleDateString('ru', { month: 'long', year: 'numeric' })
    : '—'

  const slots = wallet?.prepaid_generations_remaining ?? 0
  const balanceMinor = wallet?.balance_minor ?? 0
  const refBalanceMinor = wallet?.referral_balance_minor ?? 0

  const initials = (() => {
    const a = tgUser?.first_name?.[0] ?? ''
    const b = tgUser?.last_name?.[0] ?? ''
    return (a + b).toUpperCase() || 'V'
  })()

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="px-5 pt-[max(env(safe-area-inset-top),20px)] pb-5 flex items-start justify-between gap-3"
      >
        <div>
          <p
            className="font-mono uppercase mb-1.5"
            style={{ fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.4)' }}
          >
            Аккаунт
          </p>
          <h1
            className="font-display"
            style={{
              fontSize: 30,
              fontWeight: 500,
              lineHeight: 0.95,
              color: 'var(--text)',
            }}
          >
            Профиль
          </h1>
        </div>
        {isAdmin && (
          <Link
            href="/admin"
            onClick={() => haptic('light')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
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

      {/* Identity */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="px-5 flex items-center gap-4 pb-6"
      >
        <div className="relative flex-shrink-0">
          <div
            className="w-[72px] h-[72px] rounded-3xl flex items-center justify-center overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, rgba(224,63,106,0.2) 0%, rgba(180,30,60,0.08) 100%)',
              border: '1px solid var(--border-rose)',
              boxShadow: '0 0 28px rgba(224,63,106,0.1)',
            }}
          >
            {tgUser?.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tgUser.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span
                className="font-display"
                style={{
                  fontSize: 28,
                  letterSpacing: '-0.02em',
                  color: 'var(--rose)',
                }}
              >
                {initials}
              </span>
            )}
          </div>
          <div
            className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full animate-breathe"
            style={{
              background: '#5fd296',
              border: '2px solid var(--bg)',
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="font-display truncate"
            style={{
              fontSize: 24,
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: '-0.018em',
              color: 'var(--text)',
            }}
          >
            {tgUser?.first_name ?? 'Гость'}
            {tgUser?.last_name ? ` ${tgUser.last_name}` : ''}
          </p>
          <p
            className="font-mono text-[11px] mt-0.5 truncate"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            {tgUser?.username ? `@${tgUser.username}` : `id ${tgUser?.id ?? '—'}`} ·{' '}
            {memberSince}
          </p>
        </div>
      </motion.section>

      {/* Stats — hairline-divided, no boxes */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="mx-5 rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-1)' }}
      >
        <div className="grid grid-cols-3">
          <Stat label="Слоты" value={String(slots)} icon={Lightning} accent="rose" />
          <Stat
            label="Баланс"
            value={`${fmtRub(balanceMinor)} ₽`}
            icon={Sparkle}
            divided
          />
          <Stat
            label="Рефералы"
            value={`${fmtRub(refBalanceMinor)} ₽`}
            icon={ShareNetwork}
            divided
            accent="gold"
          />
        </div>
      </motion.section>

      {/* Referral block — premium gold accent */}
      {me?.referral_deep_link && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="mx-5 mt-3"
        >
          <ReferralCard
            link={me.referral_deep_link}
            code={me.referral_code ?? ''}
            earnedMinor={refBalanceMinor}
          />
        </motion.section>
      )}

      {/* Footer hint */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="px-5 mt-8"
      >
        <div className="h-px mb-4" style={{ background: 'var(--border-1)' }} />
        <div className="flex items-baseline gap-2">
          <IdentificationCard size={11} color="rgba(255,255,255,0.3)" />
          <p
            className="font-mono"
            style={{ fontSize: 10, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.32)' }}
          >
            ID {tgUser?.id ?? '—'} · история хранится 72 часа
          </p>
        </div>
      </motion.section>

      <BottomNav />
    </div>
  )
}

// =====================================================================

function Stat({
  label,
  value,
  icon: Icon,
  divided,
  accent = 'rose',
}: {
  label: string
  value: string
  icon: React.ElementType
  divided?: boolean
  accent?: 'rose' | 'gold'
}) {
  const color = accent === 'gold' ? 'var(--gold)' : 'var(--rose)'
  return (
    <div
      className="px-3 py-3.5 flex flex-col gap-1.5"
      style={{
        borderLeft: divided ? '1px solid var(--border-1)' : 'none',
      }}
    >
      <div className="flex items-center gap-1.5">
        <Icon size={11} weight="fill" color={color} />
        <span
          className="font-mono uppercase"
          style={{ fontSize: 9, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.5)' }}
        >
          {label}
        </span>
      </div>
      <p
        className="font-mono"
        style={{
          fontSize: 18,
          letterSpacing: '-0.01em',
          color: 'var(--text)',
        }}
      >
        {value}
      </p>
    </div>
  )
}

function ReferralCard({
  link,
  code,
  earnedMinor,
}: {
  link: string
  code: string
  earnedMinor: number
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      hapticNotify('success')
      setTimeout(() => setCopied(false), 1800)
    } catch {
      hapticNotify('error')
    }
  }

  return (
    <div
      className="rounded-3xl overflow-hidden relative"
      style={{
        background:
          'linear-gradient(135deg, rgba(201,150,106,0.1) 0%, rgba(31,25,41,0.6) 100%)',
        border: '1px solid rgba(201,150,106,0.22)',
      }}
    >
      <div className="px-5 pt-5 pb-4 flex flex-col gap-1">
        <p
          className="font-mono uppercase mb-1"
          style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--gold)' }}
        >
          Реферальная программа
        </p>
        <h3
          className="font-display"
          style={{
            fontSize: 22,
            fontWeight: 500,
            lineHeight: 1.05,
            color: 'var(--text)',
          }}
        >
          Получай % с покупок друзей
        </h3>
        <p className="text-[12px] mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {earnedMinor > 0
            ? `Уже заработано ${fmtRub(earnedMinor)} ₽`
            : 'Делись ссылкой — начисления приходят автоматически'}
        </p>
      </div>

      <div
        className="mx-3 mb-3 rounded-2xl px-3 py-2.5 flex items-center gap-2"
        style={{
          background: 'rgba(0,0,0,0.32)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <span
          className="font-mono text-[12px] flex-1 truncate"
          style={{ color: 'rgba(255,255,255,0.85)' }}
          aria-label={`Реферальный код ${code}`}
        >
          {link.replace(/^https?:\/\//, '')}
        </span>
        <button
          onClick={copy}
          className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
          style={{
            background: copied ? 'rgba(95,210,150,0.15)' : 'var(--rose-dim)',
            border: copied
              ? '1px solid rgba(95,210,150,0.32)'
              : '1px solid var(--border-rose)',
            transition: 'all 0.18s ease',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {copied ? (
            <Check size={14} color="#5fd296" weight="bold" />
          ) : (
            <Copy size={14} color="var(--rose)" weight="bold" />
          )}
        </button>
      </div>

      <Link
        href="/shop"
        onClick={() => haptic('light')}
        className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
        style={{
          background: 'rgba(0,0,0,0.32)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        aria-label="К магазину"
      >
        <ArrowRight size={13} color="rgba(255,255,255,0.6)" weight="bold" />
      </Link>
    </div>
  )
}
