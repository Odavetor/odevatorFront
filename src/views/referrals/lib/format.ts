const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Date.now() - then
  if (diff < MINUTE) return 'только что'
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} мин назад`
  if (diff < DAY) return `${Math.floor(diff / HOUR)} ч назад`
  const days = Math.floor(diff / DAY)
  if (days === 1) return 'вчера'
  if (days < 7) return `${days} дн назад`
  return new Date(iso).toLocaleDateString('ru', { day: 'numeric', month: 'short' })
}

export function pct(part: number, whole: number): number {
  if (whole <= 0) return 0
  return Math.round((part / whole) * 100)
}
