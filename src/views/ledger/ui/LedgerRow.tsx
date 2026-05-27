import { ArrowDown, ArrowUp } from '@phosphor-icons/react'
import type { LedgerEntry } from '@shared/api'
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
  const positive = entry.delta_minor >= 0
  const deltaKind = getDeltaKind(entry.wallet_bucket)
  const Icon = positive ? ArrowUp : ArrowDown
  const accentColor = positive ? 'var(--splash-green)' : 'var(--rose)'
  const accentBg = positive ? 'var(--splash-green-bg)' : 'var(--rose-mist)'
  const accentBorder = positive
    ? 'rgba(95,210,150,0.32)'
    : 'var(--border-rose)'

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
          background: accentBg,
          border: `1px solid ${accentBorder}`,
        }}
      >
        <Icon size={14} weight="bold" color={accentColor} />
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

      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
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
          остаток {deltaKind === 'money' ? `${Math.round(entry.balance_after_minor / 100).toLocaleString('ru')} ₽` : entry.balance_after_minor}
        </span>
      </div>
    </div>
  )
}
