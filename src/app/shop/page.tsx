'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getUser, haptic, hapticNotify, openLink } from '@/lib/telegram'
import PackageCard from '@/components/PackageCard'
import BottomNav from '@/components/BottomNav'
import CurrencyPill from '@/components/CurrencyPill'
import { useUser } from '@/components/TelegramProvider'
import type { Package, PaymentMethod } from '@/types'
import { CurrencyDollar, Bank, CreditCard, CheckCircle } from '@phosphor-icons/react'

const PACKAGES: Package[] = [
  { id: '1', count: 1, price: 59, label: '1 обработка' },
  { id: '10', count: 10, price: 349, label: '10 обработок', savingsLabel: '−41%' },
  { id: '25', count: 25, price: 690, label: '25 обработок', popular: true, savingsLabel: '−53%' },
  { id: '50', count: 50, price: 1190, label: '50 обработок', savingsLabel: '−59%' },
]

const METHODS: Array<{ id: PaymentMethod; label: string; sub: string; icon: React.ElementType }> = [
  { id: 'cryptobot', label: 'CryptoBot', sub: 'USDT', icon: CurrencyDollar },
  { id: 'platega_sbp', label: 'СБП', sub: 'QR-код', icon: Bank },
  { id: 'platega_crypto', label: 'Crypto', sub: 'Через Platega', icon: CurrencyDollar },
  { id: 'rollypay', label: 'СБП #2', sub: 'RollyPay', icon: CreditCard },
]

type Step = 'packages' | 'method' | 'pending' | 'success'

export default function ShopPage() {
  const { refreshBalance } = useUser()
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [step, setStep] = useState<Step>('packages')
  const [invoiceUrl, setInvoiceUrl] = useState('')
  const [invoiceId, setInvoiceId] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)

  const pkg = PACKAGES.find((p) => p.id === selectedPkg)

  async function createInvoice() {
    if (!selectedPkg || !selectedMethod) return
    const user = getUser()
    if (!user) return

    setLoading(true)
    haptic('medium')

    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          packageId: selectedPkg,
          method: selectedMethod,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        hapticNotify('error')
        return
      }

      setInvoiceUrl(data.invoiceUrl)
      setInvoiceId(data.invoiceId)
      setStep('pending')
      openLink(data.invoiceUrl)
    } finally {
      setLoading(false)
    }
  }

  async function checkPayment() {
    if (!invoiceId || !selectedMethod) return
    const user = getUser()
    if (!user) return

    setChecking(true)
    try {
      const res = await fetch(
        `/api/payment/check/${invoiceId}?method=${selectedMethod}&userId=${user.id}&packageId=${selectedPkg}`,
      )
      const data = await res.json()

      if (data.status === 'paid') {
        setStep('success')
        hapticNotify('success')
        refreshBalance()
      } else {
        hapticNotify('warning')
      }
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-start justify-between px-5 pt-7 pb-4"
      >
        <div>
          <p className="text-cream-700 text-gr-2xs uppercase tracking-[0.15em] mb-0.5">Слоты</p>
          <h1 className="font-display text-gr-xl text-cream-100">Магазин</h1>
        </div>
        <CurrencyPill />
      </motion.header>

      <div className="flex-1 px-5 pb-4">
        <AnimatePresence mode="wait">
          {/* Step 1: packages */}
          {step === 'packages' && (
            <motion.div
              key="packages"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-4"
            >
              <div
                className="flex flex-col"
                style={{ marginLeft: -20, marginRight: -20 }}
              >
                {PACKAGES.map((pkg, i) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, delay: Math.min(i, 4) * 0.04, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      borderTop: i === 0 ? '1px solid var(--border-1)' : undefined,
                      borderBottom: '1px solid var(--border-1)',
                    }}
                  >
                    <PackageCard
                      pkg={pkg}
                      selected={selectedPkg === pkg.id}
                      onSelect={setSelectedPkg}
                    />
                  </motion.div>
                ))}
              </div>

              <AnimatePresence>
                {selectedPkg && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => {
                      haptic('medium')
                      setStep('method')
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-2xl font-medium text-base text-white"
                    style={{
                      background: 'linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 1px 0 rgba(0,0,0,0.4)',
                    }}
                  >
                    Выбрать способ оплаты →
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Step 2: method */}
          {step === 'method' && (
            <motion.div
              key="method"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-4"
            >
              {/* Selected package summary */}
              <div
                className="flex items-center justify-between rounded-2xl p-4"
                style={{ background: 'rgba(224,63,106,0.08)', border: '1px solid rgba(224,63,106,0.18)' }}
              >
                <div>
                  <p className="text-cream-600 text-xs mb-0.5">Выбран пакет</p>
                  <p className="text-cream-100 font-medium">{pkg?.label}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xl font-semibold text-rose-400">
                    {pkg?.price.toLocaleString('ru')} ₽
                  </p>
                </div>
              </div>

              <p className="text-cream-700 text-gr-2xs uppercase tracking-[0.12em]">Способ оплаты</p>

              <div className="flex flex-col gap-2">
                {METHODS.map((m, i) => {
                  const Icon = m.icon
                  const active = selectedMethod === m.id
                  return (
                    <motion.button
                      key={m.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      onClick={() => {
                        haptic()
                        setSelectedMethod(m.id)
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 rounded-2xl p-4 text-left"
                      style={{
                        background: active
                          ? 'rgba(224,63,106,0.1)'
                          : 'rgba(31,25,41,0.8)',
                        border: active
                          ? '1px solid rgba(224,63,106,0.32)'
                          : '1px solid rgba(255,255,255,0.07)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: active ? 'rgba(224,63,106,0.15)' : 'rgba(255,255,255,0.05)',
                          border: active ? '1px solid rgba(224,63,106,0.22)' : '1px solid rgba(255,255,255,0.07)',
                        }}
                      >
                        <Icon size={17} color={active ? '#e03f6a' : '#7a4a5e'} />
                      </div>
                      <div className="flex-1">
                        <p className="text-cream-100 text-sm font-medium">{m.label}</p>
                        <p className="text-cream-700 text-gr-2xs">{m.sub}</p>
                      </div>
                      {active && (
                        <CheckCircle size={18} color="#e03f6a" weight="fill" />
                      )}
                    </motion.button>
                  )
                })}
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={createInvoice}
                  disabled={!selectedMethod || loading}
                  className="w-full py-4 rounded-2xl font-medium text-base"
                  style={{
                    background: selectedMethod
                      ? 'linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%)'
                      : 'rgba(31,31,40,0.8)',
                    border: selectedMethod ? 'none' : '1px solid var(--border-1)',
                    boxShadow: selectedMethod
                      ? 'inset 0 1px 0 rgba(255,255,255,0.15), 0 1px 0 rgba(0,0,0,0.4)'
                      : 'none',
                    color: selectedMethod ? '#FFFFFF' : 'var(--text-3)',
                    transition: 'all 0.25s ease',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? 'Создаю счёт…' : `Оплатить ${pkg?.price.toLocaleString('ru')} ₽`}
                </button>
                <button
                  onClick={() => {
                    haptic()
                    setStep('packages')
                  }}
                  className="w-full py-3 rounded-2xl text-sm font-medium text-cream-700"
                  style={{ background: 'rgba(22,18,28,0.5)' }}
                >
                  Назад
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: pending payment */}
          {step === 'pending' && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-5"
            >
              <div
                className="rounded-3xl p-8 flex flex-col items-center gap-4 text-center"
                style={{ background: 'rgba(31,25,41,0.8)', border: '1px solid var(--border-1)' }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--rose-dim)', border: '1px solid var(--border-rose)' }}
                >
                  <Bank size={28} color="var(--rose)" weight="duotone" />
                </div>

                <div>
                  <p className="text-cream-100 font-medium text-lg mb-1">Ожидание оплаты</p>
                  <p className="text-cream-700 text-sm max-w-[260px]">
                    Оплатите счёт и нажмите кнопку ниже для подтверждения
                  </p>
                </div>

                <div
                  className="font-mono text-2xl font-semibold"
                  style={{ color: 'var(--rose)' }}
                >
                  {pkg?.price.toLocaleString('ru')} ₽
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => openLink(invoiceUrl)}
                  className="w-full py-4 rounded-2xl font-medium text-base text-white"
                  style={{
                    background: 'linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 1px 0 rgba(0,0,0,0.4)',
                  }}
                >
                  Открыть счёт
                </button>

                <button
                  onClick={checkPayment}
                  disabled={checking}
                  className="w-full py-4 rounded-2xl font-medium text-base"
                  style={{
                    background: 'rgba(31,25,41,0.9)',
                    border: '1px solid var(--border-2)',
                    color: 'var(--text-2)',
                    opacity: checking ? 0.7 : 1,
                  }}
                >
                  {checking ? 'Проверяю…' : 'Я оплатил'}
                </button>

                <button
                  onClick={() => {
                    haptic()
                    setStep('packages')
                    setSelectedMethod(null)
                  }}
                  className="text-cream-700 text-sm py-2"
                >
                  Отмена
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: success */}
          {step === 'success' && (
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
                style={{
                  background: 'var(--rose-dim)',
                  border: '1px solid var(--border-rose)',
                }}
              >
                <CheckCircle size={40} color="var(--rose)" weight="fill" />
              </motion.div>

              <div className="text-center">
                <p className="font-display text-gr-xl text-cream-100 mb-2">Оплачено</p>
                <p className="text-cream-700 text-sm">
                  {pkg?.count} обработок добавлено на ваш счёт
                </p>
              </div>

              <button
                onClick={() => {
                  haptic()
                  setStep('packages')
                  setSelectedPkg(null)
                  setSelectedMethod(null)
                }}
                className="w-full py-4 rounded-2xl font-medium"
                style={{
                  background: 'rgba(31,25,41,0.8)',
                  border: '1px solid var(--border-1)',
                  color: 'var(--text-2)',
                }}
              >
                Назад в магазин
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  )
}
