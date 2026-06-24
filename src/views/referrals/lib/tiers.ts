import { tt } from '@shared/lib'

const TIER_NAMES: Record<string, { ru: string; en: string; de: string }> = {
  Новичок: { ru: 'Новичок', en: 'Newbie', de: 'Neuling' },
  Боец: { ru: 'Боец', en: 'Fighter', de: 'Kämpfer' },
  Профи: { ru: 'Профи', en: 'Pro', de: 'Profi' },
  Мастер: { ru: 'Мастер', en: 'Master', de: 'Meister' },
  Легенда: { ru: 'Легенда', en: 'Legend', de: 'Legende' },
}

export function localizeTier(name: string | null | undefined): string {
  if (!name) return ''
  const m = TIER_NAMES[name]
  return m ? tt(m) : name
}
