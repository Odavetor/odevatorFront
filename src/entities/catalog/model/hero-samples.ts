import type { HeroSample } from '@entities/catalog/types'

export const HERO_SAMPLES: HeroSample[] = [
  {
    id: 'clothing',
    before: '/hero/before.jpg',
    after: '/hero/after.jpg',
    category: 'Стиль',
    label: 'Бикини',
  },
  {
    id: 'background',
    before: 'https://picsum.photos/id/177/600/700',
    after: 'https://picsum.photos/id/823/600/700',
    category: 'Фон',
    label: 'Пляж',
  },
  {
    id: 'pose',
    before: 'https://picsum.photos/id/433/600/700',
    after: 'https://picsum.photos/id/669/600/700',
    category: 'Поза',
    label: 'Лёжа',
  },
  {
    id: 'body',
    before: 'https://picsum.photos/id/491/600/700',
    after: 'https://picsum.photos/id/596/600/700',
    category: 'Тело',
    label: 'Спортивное',
  },
]
