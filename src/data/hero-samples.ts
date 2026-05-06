export interface HeroSample {
  id: string
  before: string
  after: string
  // Любое имя категории — должно совпадать с label из админского каталога
  // (когда hero подтягивается с бэка, сюда придёт cat.label).
  category: string
  label: string
}

// Используем picsum.photos/id/{N} — это конкретные изображения (не рандомные seeds).
// Подобраны id'шники, которые отдают портреты/фигуры. Если бэк позже подложит
// реальные превью каталога — этот файл просто перестанет использоваться
// (CinematicHero берёт картинки из переданных `samples`).
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
