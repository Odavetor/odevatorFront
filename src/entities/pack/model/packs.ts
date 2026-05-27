import type { GenerationPackOption } from '@shared/api'
import { generationsPluralRu } from '@entities/pack/lib/pricing'

export type SplashColor = 'rose' | 'violet' | 'cyan' | 'orange' | 'green'

export interface PackMeta {
  title: string
  sub: string
  splash: SplashColor
  featured?: boolean
  badge?: string
}

export function getPackMeta(opt: GenerationPackOption): PackMeta {
  const q = opt.quantity
  if (q === 1) {
    return { title: '1 фото', sub: 'попробовать', splash: 'cyan' }
  }
  if (q === 3) {
    return {
      title: '3 фото',
      sub: 'на вечер',
      splash: 'rose',
      featured: true,
      badge: 'выбор большинства',
    }
  }
  if (q <= 12) {
    return { title: `${q} фото`, sub: 'выгоднее всего', splash: 'violet' }
  }
  if (q <= 30) {
    return { title: `${q} фото`, sub: 'про-набор', splash: 'orange' }
  }
  return {
    title: `${q} ${generationsPluralRu(q)}`,
    sub: 'максимум',
    splash: 'green',
  }
}

export function isFeaturedQuantity(q: number): boolean {
  return q === 3
}
