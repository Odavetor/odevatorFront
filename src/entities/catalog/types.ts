export interface FilterOption {
  id: string
  numericId?: number
  label: string
  beforeExample: string
  afterExample: string
  prompt_text?: string
  ai_model_type?: 2 | 3
  width?: number
  height?: number
  sort_order?: number
  description?: string
  price_minor?: number | null
}

export interface FilterCategory {
  id: string
  numericId?: number
  label: string
  sort_order?: number
  description?: string
  options: FilterOption[]
}

export interface VideoScenario {
  id: string
  numericId?: number
  label: string
  description: string
  thumbnail: string
  durationSec: number
  slots: number
  prompt_text?: string
  sort_order?: number
  description_full?: string
  price_minor?: number | null
}

export interface HeroSample {
  id: string
  before: string
  after: string
  category: string
  label: string
}

export const VIDEO_DURATIONS = [5, 8, 10] as const
export type VideoDuration = (typeof VIDEO_DURATIONS)[number]

export const VIDEO_SLOT_COST: Record<VideoDuration, number> = {
  5: 2,
  8: 3,
  10: 5,
}
