export interface HeroSample {
  id: string
  before: string
  after: string
  label: string
}

export const HERO_SAMPLES: HeroSample[] = [
  {
    id: 'sample-1',
    before: 'https://picsum.photos/seed/hero-b-64/500/600',
    after: 'https://picsum.photos/seed/hero-a-177/500/600',
    label: 'Editorial Black',
  },
  {
    id: 'sample-2',
    before: 'https://picsum.photos/seed/hero-b-26/500/600',
    after: 'https://picsum.photos/seed/hero-a-338/500/600',
    label: 'Velvet Couture',
  },
  {
    id: 'sample-3',
    before: 'https://picsum.photos/seed/hero-b-433/500/600',
    after: 'https://picsum.photos/seed/hero-a-453/500/600',
    label: 'Studio Light',
  },
  {
    id: 'sample-4',
    before: 'https://picsum.photos/seed/hero-b-491/500/600',
    after: 'https://picsum.photos/seed/hero-a-519/500/600',
    label: 'Atelier',
  },
]
