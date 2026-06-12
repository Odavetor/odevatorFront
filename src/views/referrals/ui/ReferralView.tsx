'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Copy, Check, ShareNetwork, TrendUp } from '@phosphor-icons/react'
import { DisplayTitle, Kicker, CountUpNumber } from '@shared/ui'
import { EASE_EDITORIAL, haptic, hapticNotify, openLink } from '@shared/lib'
import { fmtRub } from '@entities/pack'
import { BottomNav } from '@widgets/bottom-nav'
import { ReviewForm } from '@features/leave-review'
import {
  createWithdrawal,
  fetchReferralMe,
  type ReferralMe,
  type Withdrawal,
  type WithdrawalStatus,
} from '@/lib/referral'
import { EarningsSparkline } from './EarningsSparkline'
import { EarningsBars } from './EarningsBars'
import { SignupsBars } from './SignupsBars'
import { SourceSplit } from './SourceSplit'
import { Funnel } from './Funnel'
import { TierBadge } from './TierBadge'
import { CommissionFeed } from './CommissionFeed'
import { PeriodTabs, type Period } from './PeriodTabs'
import { pct } from '../lib/format'

const STATUS: Record<WithdrawalStatus, { label: string; color: string }> = {
  pending: { label: 'в обработке', color: '#C9966A' },
  approved: { label: 'выплачено', color: '#5FD296' },
  rejected: { label: 'отклонено', color: '#ff9aae' },
}

const PERIOD_LABEL: Record<Period, string> = {
  today: 'сегодня',
  '7d': 'за 7 дней',
  '30d': 'за 30 дней',
  all: 'за всё время',
}

export function ReferralView() {
  const router = useRouter()
  const [data, setData] = useState<ReferralMe | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('7d')
  const [amount, setAmount] = useState('')
  const [details, setDetails] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function reload() {
    try {
      setData(await fetchReferralMe())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить данные')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  const s = data?.summary
  const balance = s?.balance_minor ?? 0
  const min = s?.min_withdrawal_minor ?? 10000
  const amountMinor = Math.round((Number(amount) || 0) * 100)
  const canWithdraw =
    !busy && amountMinor >= min && amountMinor <= balance && details.trim().length > 0

  const periodEarned = useMemo(() => {
    if (!s) return 0
    switch (period) {
      case 'today':
        return s.earned_today_minor
      case '7d':
        return s.earned_7d_minor
      case '30d':
        return s.earned_30d_minor
      default:
        return s.total_earned_minor
    }
  }, [s, period])

  const sparkDays = period === '30d' || period === 'all' ? 30 : 7

  async function copyLink() {
    if (!s?.deep_link) return
    try {
      await navigator.clipboard.writeText(s.deep_link)
      setCopied(true)
      hapticNotify('success')
      setTimeout(() => setCopied(false), 1600)
    } catch {
      hapticNotify('error')
    }
  }

  function share() {
    if (!s?.deep_link) return
    haptic('light')
    const url = `https://t.me/share/url?url=${encodeURIComponent(s.deep_link)}&text=${encodeURIComponent('Попробуй — обработка фото нейросетью')}`
    openLink(url)
  }

  async function submit() {
    setError(null)
    setNotice(null)
    setBusy(true)
    try {
      await createWithdrawal(amountMinor, details.trim())
      hapticNotify('success')
      setNotice('Заявка создана. Сумма заморожена до решения администратора.')
      setAmount('')
      setDetails('')
      await reload()
    } catch (e) {
      hapticNotify('error')
      setError(e instanceof Error ? e.message : 'Не удалось создать заявку')
    } finally {
      setBusy(false)
    }
  }

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
          <DisplayTitle size="md">Партнёрка</DisplayTitle>
        </div>
      </motion.header>

      <div className="flex flex-1 flex-col gap-5 px-5 pb-6">
        {loading && !data ? (
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Загрузка…
          </p>
        ) : s ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE_EDITORIAL }}
              className="flex flex-col gap-3 rounded-2xl px-4 py-4"
              style={{
                background: 'linear-gradient(135deg, var(--rose-dim) 0%, rgba(15,13,18,0.6) 100%)',
                border: '1px solid var(--border-rose)',
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Доступно к выводу
                  </span>
                  <span
                    className="font-sans tabular-nums"
                    style={{
                      fontSize: 34,
                      fontWeight: 800,
                      letterSpacing: '-0.03em',
                      color: 'var(--rose)',
                      lineHeight: 1,
                    }}
                  >
                    <CountUpNumber
                      to={balance / 100}
                      format={(n) => `${fmtRub(Math.round(n) * 100)} ₽`}
                    />
                  </span>
                </div>
                <div
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
                  style={{ background: 'rgba(95,210,150,0.12)' }}
                >
                  <TrendUp size={13} color="#5FD296" weight="bold" />
                  <span
                    className="font-sans text-[13px] font-bold tabular-nums"
                    style={{ color: '#5FD296' }}
                  >
                    {fmtRub(periodEarned)} ₽
                  </span>
                </div>
              </div>

              <EarningsSparkline series={data.earnings_series} days={sparkDays} />

              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  заработано {PERIOD_LABEL[period]}
                </span>
                <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {s.commission_percent}% с покупок
                </span>
              </div>
            </motion.div>

            <PeriodTabs value={period} onChange={setPeriod} />

            <div className="grid grid-cols-2 gap-2.5">
              <Stat label="Приглашено" value={`${s.invited}`} />
              <Stat
                label="Конверсия в оплату"
                value={`${pct(s.invited_paid, s.invited)}%`}
                accent
              />
              <Stat label="Всего заработано" value={`${fmtRub(s.total_earned_minor)} ₽`} />
              <Stat label="Выведено" value={`${fmtRub(s.total_withdrawn_minor)} ₽`} />
              {s.pending_minor > 0 && (
                <Stat label="В заявках (заморожено)" value={`${fmtRub(s.pending_minor)} ₽`} />
              )}
            </div>

            <TierBadge tier={data.tier} />

            <Funnel clicks={s.clicks} invited={s.invited} paid={s.invited_paid} />

            <div
              className="flex flex-col gap-4 rounded-2xl px-4 py-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <EarningsBars series={data.earnings_series} days={sparkDays} />
              <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <SourceSplit purchaseMinor={s.earned_purchase_minor} genMinor={s.earned_gen_minor} />
              <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <SignupsBars series={data.signups_series} />
            </div>

            {s.deep_link && (
              <div className="flex flex-col gap-2">
                <span className="text-kicker">ваша ссылка</span>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 truncate rounded-xl px-3 py-2.5 font-mono text-[12px]"
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.7)',
                    }}
                  >
                    {s.deep_link}
                  </div>
                  <button
                    onClick={copyLink}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: 'var(--rose-dim)',
                      border: '1px solid var(--border-rose)',
                    }}
                  >
                    {copied ? (
                      <Check size={16} color="#5fd296" weight="bold" />
                    ) : (
                      <Copy size={16} color="var(--rose)" />
                    )}
                  </button>
                </div>
                <button
                  onClick={share}
                  className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-2)',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                >
                  <ShareNetwork size={15} weight="fill" /> Поделиться в Telegram
                </button>
              </div>
            )}

            <CommissionFeed events={data.recent} />

            {error && <Banner tone="error">{error}</Banner>}
            {notice && <Banner tone="ok">{notice}</Banner>}

            <section className="flex flex-col gap-2.5">
              <h3 className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
                Вывод средств
              </h3>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder={`Сумма, ₽ (мин. ${Math.round(min / 100)})`}
                className="w-full rounded-xl px-3 py-2.5 font-mono text-sm"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white',
                }}
              />
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={2}
                placeholder="Реквизиты: номер карты / телефон / кошелёк"
                className="w-full resize-y rounded-xl px-3 py-2.5 text-sm"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white',
                }}
              />
              <button
                onClick={submit}
                disabled={!canWithdraw}
                className="no-tap-highlight rounded-xl py-3.5 text-sm font-semibold"
                style={{
                  background: canWithdraw
                    ? 'linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%)'
                    : 'rgba(255,255,255,0.04)',
                  color: canWithdraw ? '#fff' : 'rgba(255,255,255,0.3)',
                }}
              >
                {busy ? 'Создаём…' : 'Создать вывод'}
              </button>
            </section>

            {data.withdrawals.length > 0 && (
              <section className="flex flex-col gap-2">
                <h3 className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  История выводов
                </h3>
                {data.withdrawals.map((w) => (
                  <WithdrawalRow key={w.id} w={w} />
                ))}
              </section>
            )}

            <div className="h-px w-full" style={{ background: 'var(--border-1)' }} />

            <ReviewForm
              kind="referrer"
              title="Отзыв о партнёрке"
              subtitle="Как вам условия и выплаты? Оценка видна только команде."
              placeholder="Что нравится в партнёрской программе, чего не хватает? (необязательно)"
            />
          </>
        ) : null}
      </div>

      <BottomNav />
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className="flex flex-col gap-0.5 rounded-xl px-3 py-2.5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {label}
      </span>
      <span
        className="font-sans tabular-nums"
        style={{
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: '-0.022em',
          color: accent ? 'var(--rose)' : 'var(--text)',
        }}
      >
        {value}
      </span>
    </div>
  )
}

function WithdrawalRow({ w }: { w: Withdrawal }) {
  const meta = STATUS[w.status]
  return (
    <div
      className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex flex-col gap-0.5">
        <span
          className="font-sans tabular-nums"
          style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}
        >
          {fmtRub(w.amount_minor)} ₽
        </span>
        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {new Date(w.created_at).toLocaleDateString('ru')}
          {w.admin_note ? ` · ${w.admin_note}` : ''}
        </span>
      </div>
      <span
        className="text-[10px] font-semibold uppercase tracking-wider"
        style={{ color: meta.color }}
      >
        {meta.label}
      </span>
    </div>
  )
}

function Banner({ tone, children }: { tone: 'error' | 'ok'; children: React.ReactNode }) {
  const ok = tone === 'ok'
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs"
      style={{
        background: ok ? 'rgba(95,210,150,0.1)' : 'rgba(180,30,60,0.12)',
        border: `1px solid ${ok ? 'rgba(95,210,150,0.28)' : 'rgba(180,30,60,0.22)'}`,
        color: ok ? '#7fe0a8' : '#ff9aae',
      }}
    >
      {children}
    </div>
  )
}
