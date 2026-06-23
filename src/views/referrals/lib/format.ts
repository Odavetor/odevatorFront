import { intlLocale, tt } from '@shared/lib'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Date.now() - then
  if (diff < MINUTE) return tt({ ru: 'только что', en: 'just now', de: 'gerade eben' })
  if (diff < HOUR)
    return tt({
      ru: `${Math.floor(diff / MINUTE)} мин назад`,
      en: `${Math.floor(diff / MINUTE)} min ago`,
      de: `vor ${Math.floor(diff / MINUTE)} Min.`,
    })
  if (diff < DAY)
    return tt({
      ru: `${Math.floor(diff / HOUR)} ч назад`,
      en: `${Math.floor(diff / HOUR)} h ago`,
      de: `vor ${Math.floor(diff / HOUR)} Std.`,
    })
  const days = Math.floor(diff / DAY)
  if (days === 1) return tt({ ru: 'вчера', en: 'yesterday', de: 'gestern' })
  if (days < 7)
    return tt({
      ru: `${days} дн назад`,
      en: `${days} d ago`,
      de: `vor ${days} Tg.`,
    })
  return new Date(iso).toLocaleDateString(intlLocale(), { day: 'numeric', month: 'short' })
}

export function pct(part: number, whole: number): number {
  if (whole <= 0) return 0
  return Math.round((part / whole) * 100)
}
