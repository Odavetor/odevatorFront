import { ArrowDown, ArrowUp } from '@phosphor-icons/react'
import type { LedgerEntry } from '@shared/api'
import { tt, intlLocale, useLang } from '@shared/lib'
import {
  formatDeltaAmount,
  getDeltaKind,
  getKindLabel,
  fmtRelativeDate,
} from '@views/ledger/lib/format'

interface Props {
  entry: LedgerEntry
}

export function LedgerRow({ entry }: Props) {
  useLang()
  const positive = entry.delta_minor >= 0
  const deltaKind = getDeltaKind(entry.wallet_bucket)
  const Icon = positive ? ArrowUp : ArrowDown
  const accentColor = positive ? 'var(--splash-green)' : 'var(--rose)'
  const accentBg = positive ? 'var(--splash-green-bg)' : 'var(--rose-mist)'
  const accentBorder = positive ? 'rgba(95,210,150,0.32)' : 'var(--border-rose)'

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
        className="flex flex-shrink-0 items-center justify-center"
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          background: accentBg,
          border: `1px solid ${accentBorder}`,
        }}
      >
        <Icon size={14} weight="bold" color={accentColor} />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="truncate font-sans"
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: 'var(--text)',
            lineHeight: 1.15,
          }}
        >
          {getKindLabel(entry.kind)}
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
          {fmtRelativeDate(entry.created_at)}
          {entry.ref_kind === 'job' && entry.ref_id ? ` · №${entry.ref_id}` : ''}
        </p>
      </div>

      <div className="flex flex-shrink-0 flex-col items-end gap-0.5">
        <span
          className="font-sans tabular-nums"
          style={{
            fontSize: 15,
            fontWeight: 800,
            letterSpacing: '-0.018em',
            color: accentColor,
            lineHeight: 1,
          }}
        >
          {formatDeltaAmount(entry)}
        </span>
        <span
          className="font-sans tabular-nums"
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.32)',
          }}
        >
          {tt({ ru: 'остаток', en: 'balance', de: 'Restbetrag' })}{' '}
          {deltaKind === 'money'
            ? `${Math.round(entry.balance_after_minor / 100).toLocaleString(intlLocale())} ₽`
            : entry.balance_after_minor}
        </span>
      </div>
    </div>
  )
}
