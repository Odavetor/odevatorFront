'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Copy, Check, ShareNetwork, TrendUp } from '@phosphor-icons/react'
import { DisplayTitle, Kicker, CountUpNumber } from '@shared/ui'
import {
  EASE_EDITORIAL,
  haptic,
  hapticNotify,
  intlLocale,
  openLink,
  tt,
  useLang,
} from '@shared/lib'
import { fmtRub } from '@entities/pack'
import { BottomNav } from '@widgets/bottom-nav'
import { ReviewForm } from '@features/leave-review'
import {
  bindAffiliateLink,
  createWithdrawal,
  fetchAffiliateCode,
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

const STATUS: Record<WithdrawalStatus, { label: () => string; color: string }> = {
  pending: {
    label: () => tt({ ru: 'в обработке', en: 'processing', de: 'in Bearbeitung' }),
    color: '#C9966A',
  },
  approved: {
    label: () => tt({ ru: 'выплачено', en: 'paid out', de: 'ausgezahlt' }),
    color: '#5FD296',
  },
  rejected: {
    label: () => tt({ ru: 'отклонено', en: 'rejected', de: 'abgelehnt' }),
    color: '#ff9aae',
  },
}

const PERIOD_LABEL: Record<Period, () => string> = {
  today: () => tt({ ru: 'сегодня', en: 'today', de: 'heute' }),
  '7d': () => tt({ ru: 'за 7 дней', en: 'over 7 days', de: 'in 7 Tagen' }),
  '30d': () => tt({ ru: 'за 30 дней', en: 'over 30 days', de: 'in 30 Tagen' }),
  all: () => tt({ ru: 'за всё время', en: 'all time', de: 'gesamt' }),
}

export function ReferralView() {
  useLang()
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
  const [affLink, setAffLink] = useState('')
  const [boundCode, setBoundCode] = useState<string | null>(null)
  const [bindBusy, setBindBusy] = useState(false)
  const [bindMsg, setBindMsg] = useState<string | null>(null)

  async function bindLink() {
    setBindMsg(null)
    setBindBusy(true)
    try {
      const r = await bindAffiliateLink(affLink.trim())
      setBoundCode(r.code || null)
      setAffLink('')
      hapticNotify('success')
      setBindMsg(tt({ ru: 'Ссылка привязана ✓', en: 'Link bound ✓', de: 'Link verknüpft ✓' }))
    } catch (e) {
      hapticNotify('error')
      setBindMsg(
        e instanceof Error
          ? e.message
          : tt({
              ru: 'Не удалось привязать',
              en: 'Failed to bind',
              de: 'Verknüpfung fehlgeschlagen',
            }),
      )
    } finally {
      setBindBusy(false)
    }
  }

  async function reload() {
    fetchAffiliateCode()
      .then((r) => setBoundCode(r.code || null))
      .catch(() => {})
    try {
      setData(await fetchReferralMe())
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : tt({
              ru: 'Не удалось загрузить данные',
              en: 'Failed to load data',
              de: 'Daten konnten nicht geladen werden',
            }),
      )
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
    const url = `https://t.me/share/url?url=${encodeURIComponent(s.deep_link)}&text=${encodeURIComponent(
      tt({
        ru: 'Попробуй — обработка фото нейросетью',
        en: 'Try it — AI photo processing',
        de: 'Probier es aus — KI-Fotobearbeitung',
      }),
    )}`
    openLink(url)
  }

  async function submit() {
    setError(null)
    setNotice(null)
    setBusy(true)
    try {
      await createWithdrawal(amountMinor, details.trim())
      hapticNotify('success')
      setNotice(
        tt({
          ru: 'Заявка создана. Сумма заморожена до решения администратора.',
          en: 'Request created. The amount is frozen until an admin decides.',
          de: 'Antrag erstellt. Der Betrag ist bis zur Entscheidung des Administrators eingefroren.',
        }),
      )
      setAmount('')
      setDetails('')
      await reload()
    } catch (e) {
      hapticNotify('error')
      setError(
        e instanceof Error
          ? e.message
          : tt({
              ru: 'Не удалось создать заявку',
              en: 'Failed to create request',
              de: 'Antrag konnte nicht erstellt werden',
            }),
      )
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
          <Kicker tone="rose">{tt({ ru: 'Аккаунт', en: 'Account', de: 'Konto' })}</Kicker>
          <DisplayTitle size="md">
            {tt({ ru: 'Партнёрка', en: 'Affiliate', de: 'Partnerprogramm' })}
          </DisplayTitle>
        </div>
      </motion.header>

      <div className="flex flex-1 flex-col gap-5 px-5 pb-6">
        {loading && !data ? (
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {tt({ ru: 'Загрузка…', en: 'Loading…', de: 'Wird geladen…' })}
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
                    {tt({
                      ru: 'Доступно к выводу',
                      en: 'Available to withdraw',
                      de: 'Verfügbar zur Auszahlung',
                    })}
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
                  {tt({
                    ru: `заработано ${PERIOD_LABEL[period]()}`,
                    en: `earned ${PERIOD_LABEL[period]()}`,
                    de: `verdient ${PERIOD_LABEL[period]()}`,
                  })}
                </span>
                <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {tt({
                    ru: `${s.commission_percent}% с покупок`,
                    en: `${s.commission_percent}% on purchases`,
                    de: `${s.commission_percent}% auf Käufe`,
                  })}
                </span>
              </div>
            </motion.div>

            <PeriodTabs value={period} onChange={setPeriod} />

            <div className="grid grid-cols-2 gap-2.5">
              <Stat
                label={tt({ ru: 'Приглашено', en: 'Invited', de: 'Eingeladen' })}
                value={`${s.invited}`}
              />
              <Stat
                label={tt({
                  ru: 'Конверсия в оплату',
                  en: 'Paid conversion',
                  de: 'Kauf-Conversion',
                })}
                value={`${pct(s.invited_paid, s.invited)}%`}
                accent
              />
              <Stat
                label={tt({ ru: 'Всего заработано', en: 'Total earned', de: 'Gesamt verdient' })}
                value={`${fmtRub(s.total_earned_minor)} ₽`}
              />
              <Stat
                label={tt({ ru: 'Выведено', en: 'Withdrawn', de: 'Ausgezahlt' })}
                value={`${fmtRub(s.total_withdrawn_minor)} ₽`}
              />
              {s.pending_minor > 0 && (
                <Stat
                  label={tt({
                    ru: 'В заявках (заморожено)',
                    en: 'In requests (frozen)',
                    de: 'In Anträgen (eingefroren)',
                  })}
                  value={`${fmtRub(s.pending_minor)} ₽`}
                />
              )}
            </div>

            <TierBadge tier={data.tier} />

            <Funnel clicks={s.clicks} invited={s.invited} paid={s.invited_paid} />

            <div
              className="flex flex-col gap-4 rounded-2xl px-4 py-4"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <EarningsBars series={data.earnings_series} days={sparkDays} />
              <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <SourceSplit purchaseMinor={s.earned_purchase_minor} genMinor={s.earned_gen_minor} />
              <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <SignupsBars series={data.signups_series} />
            </div>

            {s.deep_link && (
              <div className="flex flex-col gap-2">
                <span className="text-kicker">
                  {tt({ ru: 'ваша ссылка', en: 'your link', de: 'dein Link' })}
                </span>
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
                  <ShareNetwork size={15} weight="fill" />{' '}
                  {tt({
                    ru: 'Поделиться в Telegram',
                    en: 'Share on Telegram',
                    de: 'In Telegram teilen',
                  })}
                </button>
              </div>
            )}

            <section
              className="flex flex-col gap-3 rounded-2xl px-4 py-4"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex flex-col gap-1">
                <span className="text-kicker">
                  {tt({
                    ru: 'партнёрская ссылка telegram',
                    en: 'telegram affiliate link',
                    de: 'telegram-partnerlink',
                  })}
                </span>
                <p
                  className="text-[12px] leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  {tt({
                    ru: '⭐ Звёзды Telegram начисляет вам автоматически. 💳 Оплаты по СБП/крипте начисляются на ваш баланс здесь — вывод вы заказываете сами. Чтобы засчитывались оплаты по СБП/крипте, привяжите свою партнёрскую ссылку Telegram (профиль бота → «Партнёрская программа» → ваша ссылка).',
                    en: '⭐ Telegram credits Stars to you automatically. 💳 SBP/crypto payments are credited to your balance here — you request the withdrawal yourself. To get SBP/crypto credited, bind your Telegram affiliate link (bot profile → “Affiliate program” → your link).',
                    de: '⭐ Sterne schreibt Telegram dir automatisch gut. 💳 SBP/Krypto-Zahlungen werden hier deinem Guthaben gutgeschrieben — die Auszahlung beantragst du selbst. Damit SBP/Krypto gutgeschrieben wird, verknüpfe deinen Telegram-Partnerlink (Bot-Profil → „Partnerprogramm“ → dein Link).',
                  })}
                </p>
              </div>

              {boundCode && (
                <div
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                  style={{
                    background: 'rgba(95,210,150,0.1)',
                    border: '1px solid rgba(95,210,150,0.28)',
                  }}
                >
                  <Check size={15} color="#5fd296" weight="bold" />
                  <span className="font-mono text-[12px]" style={{ color: '#7fe0a8' }}>
                    {tt({ ru: 'Привязано', en: 'Bound', de: 'Verknüpft' })}: _tgr_{boundCode}
                  </span>
                </div>
              )}

              <input
                value={affLink}
                onChange={(e) => setAffLink(e.target.value)}
                placeholder="https://t.me/lucid_ai_robot?start=_tgr_…"
                className="w-full rounded-xl px-3 py-2.5 font-mono text-[12px]"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white',
                }}
              />
              <button
                onClick={bindLink}
                disabled={bindBusy || affLink.trim().length === 0}
                className="no-tap-highlight rounded-xl py-3 text-sm font-semibold"
                style={{
                  background:
                    !bindBusy && affLink.trim().length > 0
                      ? 'linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%)'
                      : 'rgba(255,255,255,0.04)',
                  color: !bindBusy && affLink.trim().length > 0 ? '#fff' : 'rgba(255,255,255,0.3)',
                }}
              >
                {bindBusy
                  ? tt({ ru: 'Привязываем…', en: 'Binding…', de: 'Wird verknüpft…' })
                  : boundCode
                    ? tt({ ru: 'Обновить ссылку', en: 'Update link', de: 'Link aktualisieren' })
                    : tt({ ru: 'Привязать ссылку', en: 'Bind link', de: 'Link verknüpfen' })}
              </button>
              {bindMsg && (
                <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {bindMsg}
                </span>
              )}
            </section>

            <CommissionFeed events={data.recent} />

            {error && <Banner tone="error">{error}</Banner>}
            {notice && <Banner tone="ok">{notice}</Banner>}

            <section className="flex flex-col gap-2.5">
              <h3 className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {tt({ ru: 'Вывод средств', en: 'Withdraw funds', de: 'Auszahlung' })}
              </h3>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder={tt({
                  ru: `Сумма, ₽ (мин. ${Math.round(min / 100)})`,
                  en: `Amount, ₽ (min. ${Math.round(min / 100)})`,
                  de: `Betrag, ₽ (mind. ${Math.round(min / 100)})`,
                })}
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
                placeholder={tt({
                  ru: 'Реквизиты: номер карты / телефон / кошелёк',
                  en: 'Payment details: card number / phone / wallet',
                  de: 'Zahlungsdaten: Kartennummer / Telefon / Wallet',
                })}
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
                {busy
                  ? tt({ ru: 'Создаём…', en: 'Creating…', de: 'Wird erstellt…' })
                  : tt({
                      ru: 'Создать вывод',
                      en: 'Create withdrawal',
                      de: 'Auszahlung erstellen',
                    })}
              </button>
            </section>

            {data.withdrawals.length > 0 && (
              <section className="flex flex-col gap-2">
                <h3 className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  {tt({
                    ru: 'История выводов',
                    en: 'Withdrawal history',
                    de: 'Auszahlungsverlauf',
                  })}
                </h3>
                {data.withdrawals.map((w) => (
                  <WithdrawalRow key={w.id} w={w} />
                ))}
              </section>
            )}

            <div className="h-px w-full" style={{ background: 'var(--border-1)' }} />

            <ReviewForm
              kind="referrer"
              title={tt({
                ru: 'Отзыв о партнёрке',
                en: 'Affiliate feedback',
                de: 'Feedback zum Partnerprogramm',
              })}
              subtitle={tt({
                ru: 'Как вам условия и выплаты? Оценка видна только команде.',
                en: 'How are the terms and payouts? Your rating is visible only to the team.',
                de: 'Wie findest du Konditionen und Auszahlungen? Die Bewertung sieht nur das Team.',
              })}
              placeholder={tt({
                ru: 'Что нравится в партнёрской программе, чего не хватает? (необязательно)',
                en: 'What do you like about the affiliate program, what is missing? (optional)',
                de: 'Was gefällt dir am Partnerprogramm, was fehlt? (optional)',
              })}
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
          {new Date(w.created_at).toLocaleDateString(intlLocale())}
          {w.admin_note ? ` · ${w.admin_note}` : ''}
        </span>
      </div>
      <span
        className="text-[10px] font-semibold uppercase tracking-wider"
        style={{ color: meta.color }}
      >
        {meta.label()}
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
