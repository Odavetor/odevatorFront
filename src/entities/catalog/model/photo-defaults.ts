import type { FilterCategory } from '@entities/catalog/types'

const PIC = (seed: string, w = 280, h = 400) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`

export const PHOTO_FILTER_CATEGORIES: FilterCategory[] = [
  {
    id: 'clothing',
    label: 'Стиль',
    options: [
      { id: 'swimsuit', label: 'Купальник', beforeExample: PIC('vb1'), afterExample: PIC('va1') },
      { id: 'bikini', label: 'Бикини', beforeExample: PIC('vb1'), afterExample: PIC('va2') },
      { id: 'lingerie', label: 'Бельё', beforeExample: PIC('vb1'), afterExample: PIC('va3') },
      { id: 'topless', label: 'Топлес', beforeExample: PIC('vb1'), afterExample: PIC('va4') },
      { id: 'nude', label: 'Без одежды', beforeExample: PIC('vb1'), afterExample: PIC('va5') },
      { id: 'sporty', label: 'Спорт', beforeExample: PIC('vb1'), afterExample: PIC('va6') },
      { id: 'casual', label: 'Кэжуал', beforeExample: PIC('vb1'), afterExample: PIC('va7') },
    ],
  },
  {
    id: 'body',
    label: 'Тело',
    options: [
      { id: 'slim', label: 'Стройное', beforeExample: PIC('vb1'), afterExample: PIC('vb2') },
      { id: 'athletic', label: 'Спортивное', beforeExample: PIC('vb1'), afterExample: PIC('vb3') },
      { id: 'curvy', label: 'Пышное', beforeExample: PIC('vb1'), afterExample: PIC('vb4') },
      { id: 'muscular', label: 'Мускулы', beforeExample: PIC('vb1'), afterExample: PIC('vb5') },
      { id: 'busty', label: 'Грудь+', beforeExample: PIC('vb1'), afterExample: PIC('vb6') },
      { id: 'booty', label: 'Попа+', beforeExample: PIC('vb1'), afterExample: PIC('vb7') },
    ],
  },
  {
    id: 'pose',
    label: 'Поза',
    options: [
      { id: 'stand', label: 'Стоя', beforeExample: PIC('vb1'), afterExample: PIC('vp1') },
      { id: 'sit', label: 'Сидя', beforeExample: PIC('vb1'), afterExample: PIC('vp2') },
      { id: 'lie', label: 'Лёжа', beforeExample: PIC('vb1'), afterExample: PIC('vp3') },
      { id: 'back', label: 'Спиной', beforeExample: PIC('vb1'), afterExample: PIC('vp4') },
      { id: 'bend', label: 'Изгиб', beforeExample: PIC('vb1'), afterExample: PIC('vp5') },
      { id: 'kneel', label: 'На коленях', beforeExample: PIC('vb1'), afterExample: PIC('vp6') },
    ],
  },
  {
    id: 'background',
    label: 'Фон',
    options: [
      { id: 'studio', label: 'Студия', beforeExample: PIC('vb1'), afterExample: PIC('vbg1') },
      { id: 'beach', label: 'Пляж', beforeExample: PIC('vb1'), afterExample: PIC('vbg2') },
      { id: 'interior', label: 'Интерьер', beforeExample: PIC('vb1'), afterExample: PIC('vbg3') },
      { id: 'nature', label: 'Природа', beforeExample: PIC('vb1'), afterExample: PIC('vbg4') },
      { id: 'city', label: 'Город', beforeExample: PIC('vb1'), afterExample: PIC('vbg5') },
      { id: 'hotel', label: 'Отель', beforeExample: PIC('vb1'), afterExample: PIC('vbg6') },
    ],
  },
]
