import { fmtRub, generationsPluralRu } from '@entities/pack'
import type { LedgerEntry } from '@shared/api'
import { tt, intlLocale } from '@shared/lib'

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
  const unit = tt({
    ru: generationsPluralRu(abs),
    en: abs === 1 ? 'generation' : 'generations',
    de: abs === 1 ? 'Generierung' : 'Generierungen',
  })
  return `${sign}${abs} ${unit}`
}

const KIND_LABELS: Record<string, () => string> = {
  generation: () => tt({ ru: 'Обработка', en: 'Processing', de: 'Verarbeitung' }),
  generation_refund: () =>
    tt({
      ru: 'Возврат за обработку',
      en: 'Processing refund',
      de: 'Rückerstattung für Verarbeitung',
    }),
  purchase: () => tt({ ru: 'Пополнение', en: 'Top-up', de: 'Aufladung' }),
  pack_purchase: () => tt({ ru: 'Покупка пакета', en: 'Pack purchase', de: 'Paketkauf' }),
  referral_payout: () =>
    tt({ ru: 'Реферальный бонус', en: 'Referral bonus', de: 'Empfehlungsbonus' }),
  referral_credit: () =>
    tt({
      ru: 'Начисление от друга',
      en: 'Credit from a friend',
      de: 'Gutschrift von einem Freund',
    }),
  welcome_bonus: () =>
    tt({ ru: 'Приветственный бонус', en: 'Welcome bonus', de: 'Willkommensbonus' }),
}

export function getKindLabel(kind: string): string {
  return KIND_LABELS[kind]?.() ?? kind.replace(/_/g, ' ')
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
    return tt({ ru: `${m} мин назад`, en: `${m} min ago`, de: `vor ${m} Min.` })
  }
  if (diff < day) {
    const h = Math.floor(diff / hour)
    return tt({ ru: `${h} ч назад`, en: `${h} h ago`, de: `vor ${h} Std.` })
  }
  if (diff < 2 * day) return tt({ ru: 'вчера', en: 'yesterday', de: 'gestern' })
  return d.toLocaleDateString(intlLocale(), { day: 'numeric', month: 'long' })
}
