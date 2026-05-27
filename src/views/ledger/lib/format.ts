import { fmtRub, generationsPluralRu } from '@entities/pack'
import type { LedgerEntry } from '@shared/api'

export type DeltaKind = 'money' | 'slots'

export function getDeltaKind(bucket: string): DeltaKind {
  const b = bucket.toLowerCase()
  if (b.includes('balance') || b.includes('referral') || b.includes('money')) {
    return 'money'
  }
  return 'slots'
}

export function formatDeltaAmount(entry: LedgerEntry): string {
  const kind = getDeltaKind(entry.wallet_bucket)
  const sign = entry.delta_minor >= 0 ? '+' : '−'
  const abs = Math.abs(entry.delta_minor)
  if (kind === 'money') {
    return `${sign}${fmtRub(abs)} ₽`
  }
  return `${sign}${abs} ${generationsPluralRu(abs)}`
}

const KIND_LABELS: Record<string, string> = {
  generation: 'Обработка',
  generation_refund: 'Возврат за обработку',
  purchase: 'Пополнение',
  pack_purchase: 'Покупка пакета',
  referral_payout: 'Реферальный бонус',
  referral_credit: 'Начисление от друга',
  welcome_bonus: 'Приветственный бонус',
}

export function getKindLabel(kind: string): string {
  return KIND_LABELS[kind] ?? kind.replace(/_/g, ' ')
}

export function fmtRelativeDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < hour) {
    const m = Math.max(1, Math.floor(diff / minute))
    return `${m} мин назад`
  }
  if (diff < day) {
    const h = Math.floor(diff / hour)
    return `${h} ч назад`
  }
  if (diff < 2 * day) return 'вчера'
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'long' })
}
