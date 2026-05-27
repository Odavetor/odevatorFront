import { Bank, CurrencyEth } from '@phosphor-icons/react'
import { PAYMENT_METHOD } from '@shared/api'
import type { PaymentTx } from '@shared/api'
import {
  fmtAmount,
  fmtRelativeDate,
  getMethodLabel,
  getStatusMeta,
} from '@views/payments/lib/format'

interface Props {
  payment: PaymentTx
}

export function PaymentRow({ payment }: Props) {
  const status = getStatusMeta(payment.status)
  const isCrypto = payment.payment_method === PAYMENT_METHOD.CRYPTO
  const Icon = isCrypto ? CurrencyEth : Bank

  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border-1)',
        borderRadius: 16,
      }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--border-2)',
        }}
      >
        <Icon size={16} weight="duotone" color="rgba(255,255,255,0.7)" />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="font-sans truncate"
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: 'var(--text)',
            lineHeight: 1.15,
          }}
        >
          {payment.description ?? 'Платёж'}
        </p>
        <p
          className="font-sans"
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.42)',
            marginTop: 2,
          }}
        >
          {getMethodLabel(payment.payment_method)} · {fmtRelativeDate(payment.created_at)}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span
          className="font-sans tabular-nums"
          style={{
            fontSize: 15,
            fontWeight: 800,
            letterSpacing: '-0.018em',
            color: 'var(--text)',
            lineHeight: 1,
          }}
        >
          {fmtAmount(payment.amount_minor)}
        </span>
        <span
          className="font-sans inline-flex items-center px-1.5 py-0.5 rounded"
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '-0.005em',
            background: status.bg,
            color: status.color,
            border: `1px solid ${status.border}`,
          }}
        >
          {status.label}
        </span>
      </div>
    </div>
  )
}
