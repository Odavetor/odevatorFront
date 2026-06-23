import type { GenerationPackOption } from '@shared/api'
import { tt } from '@shared/lib'
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
    return {
      title: tt({ ru: '1 фото', en: '1 photo', de: '1 Foto' }),
      sub: tt({ ru: 'попробовать', en: 'try it out', de: 'ausprobieren' }),
      splash: 'cyan',
    }
  }
  if (q === 3) {
    return {
      title: tt({ ru: '3 фото', en: '3 photos', de: '3 Fotos' }),
      sub: tt({ ru: 'на вечер', en: 'for the evening', de: 'für den Abend' }),
      splash: 'rose',
      featured: true,
      badge: tt({ ru: 'выбор большинства', en: 'most popular', de: 'beliebteste Wahl' }),
    }
  }
  if (q <= 12) {
    return {
      title: tt({ ru: `${q} фото`, en: `${q} photos`, de: `${q} Fotos` }),
      sub: tt({ ru: 'выгоднее всего', en: 'best value', de: 'bestes Angebot' }),
      splash: 'violet',
    }
  }
  if (q <= 30) {
    return {
      title: tt({ ru: `${q} фото`, en: `${q} photos`, de: `${q} Fotos` }),
      sub: tt({ ru: 'про-набор', en: 'pro pack', de: 'Pro-Paket' }),
      splash: 'orange',
    }
  }
  return {
    title: `${q} ${generationsPluralRu(q)}`,
    sub: tt({ ru: 'максимум', en: 'maximum', de: 'Maximum' }),
    splash: 'green',
  }
}

export function isFeaturedQuantity(q: number): boolean {
  return q === 3
}
