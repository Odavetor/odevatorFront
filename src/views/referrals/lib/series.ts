export function dailyBuckets(days: number, lookup: (dateKey: string) => number): number[] {
  const out: number[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    out.push(lookup(d.toISOString().slice(0, 10)))
  }
  return out
}

export function dayLabel(daysAgo: number, total: number): string {
  if (daysAgo === total - 1) return 'сегодня'
  const d = new Date()
  d.setDate(d.getDate() - (total - 1 - daysAgo))
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'short' })
}
