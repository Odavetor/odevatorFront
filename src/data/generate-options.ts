const PIC = (seed: string, w = 280, h = 400) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`

export interface FilterOption {
  id: string
  label: string
  beforeExample: string
  afterExample: string
  // Параметры генерации (опциональны на фронте — приходят из админки/бэка):
  // - prompt_text  — что подсунуть AI-провайдеру
  // - ai_model_type — модель провайдера (2 или 3, см. бэк-валидацию)
  // - width / height — размеры результата (1..1024)
  prompt_text?: string
  ai_model_type?: 2 | 3
  width?: number
  height?: number
}

export interface FilterCategory {
  id: string
  label: string
  options: FilterOption[]
}

export interface VideoScenario {
  id: string
  label: string
  description: string
  thumbnail: string
  durationSec: number
  slots: number
}

export const PHOTO_FILTER_CATEGORIES: FilterCategory[] = [
  {
    id: 'clothing',
    label: 'Стиль',
    options: [
      { id: 'swimsuit',  label: 'Купальник',   beforeExample: PIC('vb1'), afterExample: PIC('va1') },
      { id: 'bikini',    label: 'Бикини',       beforeExample: PIC('vb1'), afterExample: PIC('va2') },
      { id: 'lingerie',  label: 'Бельё',        beforeExample: PIC('vb1'), afterExample: PIC('va3') },
      { id: 'topless',   label: 'Топлес',       beforeExample: PIC('vb1'), afterExample: PIC('va4') },
      { id: 'nude',      label: 'Без одежды',   beforeExample: PIC('vb1'), afterExample: PIC('va5') },
      { id: 'sporty',    label: 'Спорт',        beforeExample: PIC('vb1'), afterExample: PIC('va6') },
      { id: 'casual',    label: 'Кэжуал',       beforeExample: PIC('vb1'), afterExample: PIC('va7') },
    ],
  },
  {
    id: 'body',
    label: 'Тело',
    options: [
      { id: 'slim',      label: 'Стройное',     beforeExample: PIC('vb1'), afterExample: PIC('vb2') },
      { id: 'athletic',  label: 'Спортивное',   beforeExample: PIC('vb1'), afterExample: PIC('vb3') },
      { id: 'curvy',     label: 'Пышное',       beforeExample: PIC('vb1'), afterExample: PIC('vb4') },
      { id: 'muscular',  label: 'Мускулы',      beforeExample: PIC('vb1'), afterExample: PIC('vb5') },
      { id: 'busty',     label: 'Грудь+',       beforeExample: PIC('vb1'), afterExample: PIC('vb6') },
      { id: 'booty',     label: 'Попа+',        beforeExample: PIC('vb1'), afterExample: PIC('vb7') },
    ],
  },
  {
    id: 'pose',
    label: 'Поза',
    options: [
      { id: 'stand',     label: 'Стоя',         beforeExample: PIC('vb1'), afterExample: PIC('vp1') },
      { id: 'sit',       label: 'Сидя',         beforeExample: PIC('vb1'), afterExample: PIC('vp2') },
      { id: 'lie',       label: 'Лёжа',         beforeExample: PIC('vb1'), afterExample: PIC('vp3') },
      { id: 'back',      label: 'Спиной',       beforeExample: PIC('vb1'), afterExample: PIC('vp4') },
      { id: 'bend',      label: 'Изгиб',        beforeExample: PIC('vb1'), afterExample: PIC('vp5') },
      { id: 'kneel',     label: 'На коленях',   beforeExample: PIC('vb1'), afterExample: PIC('vp6') },
    ],
  },
  {
    id: 'background',
    label: 'Фон',
    options: [
      { id: 'studio',    label: 'Студия',       beforeExample: PIC('vb1'), afterExample: PIC('vbg1') },
      { id: 'beach',     label: 'Пляж',         beforeExample: PIC('vb1'), afterExample: PIC('vbg2') },
      { id: 'interior',  label: 'Интерьер',     beforeExample: PIC('vb1'), afterExample: PIC('vbg3') },
      { id: 'nature',    label: 'Природа',      beforeExample: PIC('vb1'), afterExample: PIC('vbg4') },
      { id: 'city',      label: 'Город',        beforeExample: PIC('vb1'), afterExample: PIC('vbg5') },
      { id: 'hotel',     label: 'Отель',        beforeExample: PIC('vb1'), afterExample: PIC('vbg6') },
    ],
  },
]

export const VIDEO_SCENARIOS: VideoScenario[] = [
  {
    id: 'striptease',
    label: 'Стриптиз',
    description: 'Медленное соблазнительное раздевание',
    thumbnail: PIC('vs1', 320, 220),
    durationSec: 5,
    slots: 3,
  },
  {
    id: 'dance',
    label: 'Танец',
    description: 'Чувственный танец в ритм',
    thumbnail: PIC('vs2', 320, 220),
    durationSec: 5,
    slots: 2,
  },
  {
    id: 'shower',
    label: 'Душ',
    description: 'Раздевание под струями воды',
    thumbnail: PIC('vs3', 320, 220),
    durationSec: 8,
    slots: 4,
  },
  {
    id: 'beach',
    label: 'Пляж',
    description: 'Прогулка по берегу моря',
    thumbnail: PIC('vs4', 320, 220),
    durationSec: 5,
    slots: 2,
  },
  {
    id: 'bed',
    label: 'В постели',
    description: 'Соблазнительная поза в постели',
    thumbnail: PIC('vs5', 320, 220),
    durationSec: 5,
    slots: 3,
  },
  {
    id: 'yoga',
    label: 'Йога',
    description: 'Гибкость и растяжка',
    thumbnail: PIC('vs6', 320, 220),
    durationSec: 8,
    slots: 3,
  },
  {
    id: 'runway',
    label: 'Подиум',
    description: 'Дефиле в стиле модели',
    thumbnail: PIC('vs7', 320, 220),
    durationSec: 5,
    slots: 2,
  },
  {
    id: 'pool',
    label: 'Бассейн',
    description: 'Игривое плавание в воде',
    thumbnail: PIC('vs8', 320, 220),
    durationSec: 8,
    slots: 4,
  },
  {
    id: 'mirror',
    label: 'Зеркало',
    description: 'Чувственная съёмка у зеркала',
    thumbnail: PIC('vs9', 320, 220),
    durationSec: 5,
    slots: 3,
  },
  {
    id: 'fitness',
    label: 'Фитнес',
    description: 'Тренировка в спортзале',
    thumbnail: PIC('vs10', 320, 220),
    durationSec: 5,
    slots: 2,
  },
]

export const VIDEO_DURATIONS = [5, 8, 10] as const
export type VideoDuration = (typeof VIDEO_DURATIONS)[number]

export const VIDEO_SLOT_COST: Record<VideoDuration, number> = {
  5: 2,
  8: 3,
  10: 5,
}
