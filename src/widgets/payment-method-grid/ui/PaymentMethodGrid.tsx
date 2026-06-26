'use client'

import { CheckCircle, CurrencyEth, Star } from '@phosphor-icons/react'
import { SbpLogo } from '@shared/ui'
import { tt, useLang } from '@shared/lib'
import { haptic } from '@/lib/telegram'
import { PAYMENT_METHOD, type PaymentMethodId } from '@/lib/api/types'

type Spec = {
  id: PaymentMethodId
  label: string
  sub: string
  icon: 'sbp' | 'crypto' | 'stars'
}

function paymentMethodsSpec(): Spec[] {
  return [
    {
      id: PAYMENT_METHOD.STARS,
      label: tt({ ru: 'Звёзды', en: 'Stars', de: 'Sterne' }),
      sub: tt({
        ru: 'Telegram Stars · мгновенно',
        en: 'Telegram Stars · instant',
        de: 'Telegram Stars · sofort',
      }),
      icon: 'stars',
    },
    {
      id: PAYMENT_METHOD.SBP,
      label: tt({ ru: 'СБП', en: 'SBP', de: 'SBP' }),
      sub: tt({
        ru: 'Российские банки · мгновенно',
        en: 'Russian banks · instant',
        de: 'Russische Banken · sofort',
      }),
      icon: 'sbp',
    },
    {
      id: PAYMENT_METHOD.CRYPTO,
      label: tt({ ru: 'Крипта', en: 'Crypto', de: 'Krypto' }),
      sub: tt({
        ru: 'USDT · до 5 минут',
        en: 'USDT · up to 5 minutes',
        de: 'USDT · bis zu 5 Minuten',
      }),
      icon: 'crypto',
    },
  ]
}

interface Props {
  selected: PaymentMethodId | null
  onSelect: (m: PaymentMethodId) => void
  stepLabel: string
}

export function PaymentMethodGrid({ selected, onSelect, stepLabel }: Props) {
  useLang()
  const methods = paymentMethodsSpec()
  return (
    <section className="flex flex-col gap-3">
      <h2
        className="font-sans"
        style={{
          fontSize: 17,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--text)',
        }}
      >
        {stepLabel}
      </h2>
      <div className="grid grid-cols-2 gap-2.5">
        {methods.map((m) => {
          const active = selected === m.id
          return (
            <button
              key={m.id}
              onClick={() => {
                haptic('light')
                onSelect(m.id)
              }}
              className="no-tap-highlight relative flex flex-col gap-2.5 rounded-2xl p-3.5 text-left"
              style={{
                background: active ? 'var(--rose-dim)' : 'rgba(255,255,255,0.03)',
                border: active ? '1.5px solid var(--rose)' : '1px solid var(--border-1)',
                boxShadow: active
                  ? 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 28px -10px rgba(224,63,106,0.45)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.03)',
                transition: 'all 0.2s var(--ease-glide)',
              }}
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  background: active ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.05)',
                  border: active ? '1px solid var(--border-rose)' : '1px solid var(--border-1)',
                }}
              >
                {m.icon === 'sbp' ? (
                  <SbpLogo size={22} />
                ) : m.icon === 'stars' ? (
                  <Star size={20} weight="fill" color={active ? 'var(--rose)' : '#f5b942'} />
                ) : (
                  <CurrencyEth
                    size={20}
                    weight="duotone"
                    color={active ? 'var(--rose)' : 'rgba(255,255,255,0.7)'}
                  />
                )}
              </span>
              <div>
                <p
                  className="font-sans"
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: active ? 'var(--rose)' : 'var(--text)',
                    lineHeight: 1.2,
                  }}
                >
                  {m.label}
                </p>
                <p
                  className="mt-0.5 font-sans"
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.45)',
                    lineHeight: 1.3,
                  }}
                >
                  {m.sub}
                </p>
              </div>
              {active && (
                <CheckCircle
                  size={14}
                  color="var(--rose)"
                  weight="fill"
                  className="absolute right-3 top-3"
                />
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}

export { paymentMethodsSpec as PAYMENT_METHODS_SPEC }
