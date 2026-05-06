'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Bank,
  CheckCircle,
  CurrencyEth,
  Lightning,
  WarningCircle,
} from '@phosphor-icons/react'
import { haptic, hapticNotify, openLink } from '@/lib/telegram'
import BottomNav from '@/components/BottomNav'
import { useUser } from '@/components/TelegramProvider'
import {
  getGenerationPackCatalog,
  initGenerationPackPayment,
} from '@/lib/api/payments'
import {
  PAYMENT_METHOD,
  type GenerationPackCatalog,
  type GenerationPackOption,
  type PaymentMethodId,
} from '@/lib/api/types'
import { useRouter } from 'next/navigation'

type Step = 'select' | 'pending' | 'success'
type Tier = 'standard' | 'weekly_promo'

const FALLBACK_OPTIONS: GenerationPackOption[] = [
  { quantity: 1, price_minor: 4900, currency: 'RUB' },
  { quantity: 3, price_minor: 12900, currency: 'RUB' },
  { quantity: 10, price_minor: 39900, currency: 'RUB' },
  { quantity: 50, price_minor: 179900, currency: 'RUB' },
]

const METHODS: Array<{
  id: PaymentMethodId
  label: string
  sub: string
  icon: React.ElementType
}> = [
  { id: PAYMENT_METHOD.SBP, label: 'СБП', sub: 'Российские банки · мгновенно', icon: Bank },
  { id: PAYMENT_METHOD.CRYPTO, label: 'Криптовалюта', sub: 'USDT · до 5 минут', icon: CurrencyEth },
]

const fmtRub = (minor: number) => Math.round(minor / 100).toLocaleString('ru')

export default function ShopPage() {
  const router = useRouter()
  const { wallet, refreshBalance } = useUser()

  const [step, setStep] = useState<Step>('select')
  const [tier, setTier] = useState<Tier>('standard')
  const [catalog, setCatalog] = useState<GenerationPackCatalog | null>(null)
  const [selectedQty, setSelectedQty] = useState<number | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  const [walletAtInit, setWalletAtInit] = useState<number>(0)

  useEffect(() => {
    let cancelled = false
    getGenerationPackCatalog()
      .then((c) => {
        if (!cancelled) setCatalog(c)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const options: GenerationPackOption[] = useMemo(() => {
    const tierData = catalog?.tiers.find((t) => t.id === tier)
    if (tierData?.options?.length) return tierData.options
    return FALLBACK_OPTIONS
  }, [catalog, tier])

  const hasPromo = useMemo(
    () => Boolean(catalog?.tiers.find((t) => t.id === 'weekly_promo')?.options?.length),
    [catalog],
  )

  const selectedOption = options.find((o) => o.quantity === selectedQty) ?? null

  const unitBaseMinor = options[0]?.price_minor ?? 4900 // 1 шт. — базовая цена
  function savingsPercent(opt: GenerationPackOption): number {
    if (opt.quantity <= 1) return 0
    const base = unitBaseMinor * opt.quantity
    if (base <= 0) return 0
    return Math.round((1 - opt.price_minor / base) * 100)
  }

  async function handlePay() {
    if (!selectedOption || !selectedMethod) return
    setLoading(true)
    setError(null)
    haptic('medium')
    try {
      const initial = wallet?.prepaid_generations_remaining ?? 0
      setWalletAtInit(initial)
      const r = await initGenerationPackPayment({
        tier,
        quantity: selectedOption.quantity,
        paymentMethod: selectedMethod,
      })
      const url = r.redirect ?? r.return ?? null
      if (!url) throw new Error('Не получили ссылку на оплату')
      setRedirectUrl(url)
      setStep('pending')
      openLink(url)
    } catch (e) {
      hapticNotify('error')
      setError(e instanceof Error ? e.message : 'Ошибка инициализации оплаты')
    } finally {
      setLoading(false)
    }
  }

  async function handleCheck() {
    if (!selectedOption) return
    setLoading(true)
    haptic('light')
    try {
      await refreshBalance()
      // через короткую паузу даём провайдеру вебхуком обновить wallet
      const after = wallet?.prepaid_generations_remaining ?? 0
      if (after > walletAtInit) {
        hapticNotify('success')
        setStep('success')
      } else {
        hapticNotify('warning')
      }
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setStep('select')
    setSelectedQty(null)
    setSelectedMethod(null)
    setRedirectUrl(null)
    setError(null)
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="px-5 pt-[max(env(safe-area-inset-top),20px)] pb-5 flex items-start justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              haptic()
              router.back()
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <ArrowLeft size={18} color="rgba(255,255,255,0.6)" />
          </button>
          <div>
            <p
              className="font-mono uppercase mb-1"
              style={{ fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.4)' }}
            >
              Магазин
            </p>
            <h1
              className="font-display"
              style={{ fontSize: 30, fontWeight: 500, lineHeight: 0.95, color: 'var(--text)' }}
            >
              Купи генерации
            </h1>
          </div>
        </div>
        {/* Balance summary, не CurrencyPill (мы и так в магазине) */}
        <div
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5"
          style={{ background: 'rgba(18,18,24,0.92)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Lightning size={13} weight="fill" color="var(--rose)" />
          <span
            className="font-mono text-xs"
            style={{ color: 'rgba(255,255,255,0.92)' }}
          >
            {wallet?.prepaid_generations_remaining ?? 0}
          </span>
        </div>
      </motion.header>

      <div className="flex-1 px-5 pb-6">
        <AnimatePresence mode="wait">
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-5"
            >
              {/* Promo toggle — показываем только если бэк отдал weekly_promo тир */}
              {hasPromo && (
                <div
                  className="flex p-1 rounded-full self-start"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {(['standard', 'weekly_promo'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        haptic('light')
                        setTier(t)
                      }}
                      className="relative px-4 py-1.5 text-xs font-medium rounded-full"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      {tier === t && (
                        <motion.div
                          layoutId="tier-tab"
                          className="absolute inset-0 rounded-full"
                          style={{
                            background:
                              t === 'weekly_promo' ? 'rgba(201,150,106,0.16)' : 'rgba(255,255,255,0.11)',
                            border:
                              t === 'weekly_promo'
                                ? '1px solid rgba(201,150,106,0.32)'
                                : '1px solid rgba(255,255,255,0.1)',
                          }}
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span
                        className="relative z-10"
                        style={{
                          color:
                            tier === t
                              ? t === 'weekly_promo'
                                ? 'var(--gold)'
                                : '#fff'
                              : 'rgba(255,255,255,0.4)',
                        }}
                      >
                        {t === 'standard' ? 'Стандарт' : 'Промо · −22%'}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Packages */}
              <section className="flex flex-col gap-2">
                <p
                  className="font-mono uppercase mb-1"
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.18em',
                    color: 'rgba(255,255,255,0.45)',
                  }}
                >
                  1 · Размер пакета
                </p>
                <div className="flex flex-col gap-2">
                  {options.map((opt, i) => {
                    const active = selectedQty === opt.quantity
                    const savings = savingsPercent(opt)
                    const unit = Math.round(opt.price_minor / opt.quantity / 100)
                    const popular = opt.quantity === 10
                    return (
                      <motion.button
                        key={opt.quantity}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: Math.min(i, 4) * 0.04,
                          duration: 0.3,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        onClick={() => {
                          haptic('light')
                          setSelectedQty(opt.quantity)
                        }}
                        whileTap={{ scale: 0.985 }}
                        className="relative rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3 text-left"
                        style={{
                          background: active ? 'var(--rose-dim)' : 'rgba(255,255,255,0.03)',
                          border: active
                            ? '1.5px solid var(--rose)'
                            : '1px solid var(--border-1)',
                          transition: 'all 0.2s ease',
                          WebkitTapHighlightColor: 'transparent',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="font-display"
                            style={{
                              fontSize: 28,
                              lineHeight: 1,
                              letterSpacing: '-0.02em',
                              color: active ? 'var(--rose)' : 'var(--text)',
                            }}
                          >
                            {opt.quantity}
                          </span>
                          <div className="flex flex-col">
                            <span
                              className="text-[12px] leading-tight"
                              style={{ color: 'rgba(255,255,255,0.55)' }}
                            >
                              {opt.quantity === 1
                                ? 'генерация'
                                : opt.quantity < 5
                                ? 'генерации'
                                : 'генераций'}
                            </span>
                            <span
                              className="font-mono text-[10px] mt-0.5"
                              style={{ color: 'rgba(255,255,255,0.38)' }}
                            >
                              {unit}₽ за шт
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {savings > 0 && (
                            <span
                              className="font-mono px-1.5 py-0.5 rounded"
                              style={{
                                fontSize: 10,
                                letterSpacing: '0.04em',
                                background: tier === 'weekly_promo' ? 'rgba(201,150,106,0.16)' : 'rgba(95,210,150,0.12)',
                                color: tier === 'weekly_promo' ? 'var(--gold)' : '#5fd296',
                                border: `1px solid ${tier === 'weekly_promo' ? 'rgba(201,150,106,0.28)' : 'rgba(95,210,150,0.22)'}`,
                              }}
                            >
                              −{savings}%
                            </span>
                          )}
                          <span
                            className="font-mono text-base font-medium"
                            style={{ color: active ? 'var(--rose)' : 'var(--text)' }}
                          >
                            {fmtRub(opt.price_minor)} ₽
                          </span>
                        </div>

                        {popular && (
                          <span
                            className="absolute -top-2 right-4 px-2 py-0.5 rounded-full font-mono uppercase"
                            style={{
                              fontSize: 9,
                              letterSpacing: '0.16em',
                              background: 'var(--rose)',
                              color: '#fff',
                              boxShadow: '0 2px 12px rgba(224,63,106,0.32)',
                            }}
                          >
                            популярно
                          </span>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </section>

              {/* Method */}
              <section className="flex flex-col gap-2">
                <p
                  className="font-mono uppercase mb-1"
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.18em',
                    color: 'rgba(255,255,255,0.45)',
                  }}
                >
                  2 · Способ оплаты
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {METHODS.map((m) => {
                    const Icon = m.icon
                    const active = selectedMethod === m.id
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          haptic('light')
                          setSelectedMethod(m.id)
                        }}
                        className="relative rounded-2xl p-3 flex flex-col gap-2 text-left"
                        style={{
                          background: active ? 'var(--rose-dim)' : 'rgba(255,255,255,0.03)',
                          border: active
                            ? '1.5px solid var(--rose)'
                            : '1px solid var(--border-1)',
                          transition: 'all 0.2s ease',
                          WebkitTapHighlightColor: 'transparent',
                        }}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{
                            background: active ? 'var(--rose-dim)' : 'rgba(255,255,255,0.05)',
                            border: active
                              ? '1px solid var(--border-rose)'
                              : '1px solid var(--border-1)',
                          }}
                        >
                          <Icon size={18} color={active ? 'var(--rose)' : 'rgba(255,255,255,0.6)'} weight="duotone" />
                        </div>
                        <div>
                          <p
                            className="font-medium text-[14px] leading-tight"
                            style={{ color: active ? 'var(--rose)' : 'var(--text)' }}
                          >
                            {m.label}
                          </p>
                          <p
                            className="text-[11px] leading-snug mt-0.5"
                            style={{ color: 'rgba(255,255,255,0.45)' }}
                          >
                            {m.sub}
                          </p>
                        </div>
                        {active && (
                          <CheckCircle
                            size={14}
                            color="var(--rose)"
                            weight="fill"
                            className="absolute top-2.5 right-2.5"
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              </section>

              {error && (
                <div
                  className="rounded-xl px-3 py-2 flex items-start gap-2 text-xs"
                  style={{
                    background: 'rgba(180,30,60,0.12)',
                    border: '1px solid rgba(180,30,60,0.22)',
                    color: '#ff9aae',
                  }}
                >
                  <WarningCircle size={14} weight="fill" />
                  <span>{error}</span>
                </div>
              )}

              {/* Confirm */}
              <motion.button
                onClick={handlePay}
                disabled={!selectedOption || !selectedMethod || loading}
                whileTap={selectedOption && selectedMethod ? { scale: 0.98 } : {}}
                className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2"
                style={{
                  background:
                    selectedOption && selectedMethod
                      ? 'linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%)'
                      : 'rgba(255,255,255,0.04)',
                  boxShadow:
                    selectedOption && selectedMethod
                      ? 'inset 0 1px 0 rgba(255,255,255,0.18), 0 8px 28px rgba(224,63,106,0.32)'
                      : 'none',
                  border: !(selectedOption && selectedMethod) ? '1px solid var(--border-1)' : 'none',
                  color: selectedOption && selectedMethod ? '#fff' : 'rgba(255,255,255,0.3)',
                  transition: 'all 0.25s ease',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading
                  ? 'Создаём счёт…'
                  : selectedOption && selectedMethod
                  ? `Оплатить ${fmtRub(selectedOption.price_minor)} ₽`
                  : selectedOption
                  ? 'Выберите способ оплаты'
                  : 'Выберите пакет'}
                {selectedOption && selectedMethod && !loading && <ArrowRight size={16} weight="bold" />}
              </motion.button>
            </motion.div>
          )}

          {/* Pending */}
          {step === 'pending' && selectedOption && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-5"
            >
              <div
                className="rounded-3xl p-7 flex flex-col items-center gap-4 text-center"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(31,25,41,0.8) 0%, rgba(13,11,16,0.8) 100%)',
                  border: '1px solid var(--border-1)',
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'var(--rose-dim)',
                    border: '1px solid var(--border-rose)',
                  }}
                >
                  <Lightning
                    size={26}
                    weight="duotone"
                    color="var(--rose)"
                    className="animate-breathe"
                  />
                </div>
                <div>
                  <p
                    className="font-display mb-1.5"
                    style={{ fontSize: 22, lineHeight: 1.1, color: 'var(--text)' }}
                  >
                    Ждём оплату
                  </p>
                  <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    Оплатите счёт и нажмите «Я оплатил»
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="font-mono"
                    style={{ fontSize: 24, color: 'var(--rose)', letterSpacing: '-0.01em' }}
                  >
                    {fmtRub(selectedOption.price_minor)} ₽
                  </span>
                  <span
                    className="text-[11px] font-mono uppercase px-2 py-0.5 rounded"
                    style={{
                      letterSpacing: '0.16em',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {METHODS.find((m) => m.id === selectedMethod)?.label}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {redirectUrl && (
                  <button
                    onClick={() => {
                      haptic('light')
                      openLink(redirectUrl)
                    }}
                    className="w-full py-4 rounded-2xl font-medium text-base text-white flex items-center justify-center gap-2"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%)',
                      boxShadow:
                        'inset 0 1px 0 rgba(255,255,255,0.18), 0 6px 24px rgba(224,63,106,0.28)',
                    }}
                  >
                    Открыть счёт ещё раз
                    <ArrowRight size={15} weight="bold" />
                  </button>
                )}

                <button
                  onClick={handleCheck}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-medium text-base"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-2)',
                    color: 'rgba(255,255,255,0.85)',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? 'Проверяем…' : 'Я оплатил'}
                </button>

                <button
                  onClick={reset}
                  className="text-cream-700 text-xs py-2"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                >
                  Отмена
                </button>
              </div>
            </motion.div>
          )}

          {/* Success */}
          {step === 'success' && selectedOption && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-6 py-10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.08, type: 'spring', stiffness: 260, damping: 20 }}
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'var(--rose-dim)', border: '1px solid var(--border-rose)' }}
              >
                <CheckCircle size={42} color="var(--rose)" weight="fill" />
              </motion.div>

              <div className="text-center">
                <p
                  className="font-display mb-2"
                  style={{ fontSize: 32, lineHeight: 1, color: 'var(--text)' }}
                >
                  Оплачено
                </p>
                <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  +{selectedOption.quantity} {selectedOption.quantity === 1 ? 'генерация' : selectedOption.quantity < 5 ? 'генерации' : 'генераций'}
                </p>
              </div>

              <div className="w-full flex flex-col gap-2">
                <button
                  onClick={() => {
                    haptic('medium')
                    router.push('/generate')
                  }}
                  className="w-full py-4 rounded-2xl font-semibold text-base text-white flex items-center justify-center gap-2"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%)',
                    boxShadow:
                      'inset 0 1px 0 rgba(255,255,255,0.18), 0 6px 24px rgba(224,63,106,0.28)',
                  }}
                >
                  Создать фото
                  <ArrowRight size={16} weight="bold" />
                </button>
                <button
                  onClick={reset}
                  className="w-full py-3 rounded-2xl text-sm"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    color: 'rgba(255,255,255,0.55)',
                  }}
                >
                  Купить ещё
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  )
}
