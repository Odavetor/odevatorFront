import type { GenerationPackOption } from '@/lib/api/types'
import { intlLocale, tt } from '@shared/lib'

export const fmtRub = (minor: number): string =>
  Math.round(minor / 100).toLocaleString(intlLocale())

export function unitPriceRub(opt: GenerationPackOption): number {
  return Math.round(opt.price_minor / opt.quantity / 100)
}

export function savingsPercent(opt: GenerationPackOption, unitBaseMinor: number): number {
  if (opt.quantity <= 1) return 0
  const base = unitBaseMinor * opt.quantity
  if (base <= 0) return 0
  return Math.round((1 - opt.price_minor / base) * 100)
}

export function generationsPluralRu(n: number): string {
  const a = Math.abs(n) % 100
  const b = a % 10
  if (a > 10 && a < 20) return tt({ ru: 'генераций', en: 'generations', de: 'Generierungen' })
  if (b > 1 && b < 5) return tt({ ru: 'генерации', en: 'generations', de: 'Generierungen' })
  if (b === 1) return tt({ ru: 'генерация', en: 'generation', de: 'Generierung' })
  return tt({ ru: 'генераций', en: 'generations', de: 'Generierungen' })
}
