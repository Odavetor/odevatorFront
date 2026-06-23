export interface FilterOption {
  id: string
  numericId?: number
  label: string
  label_en?: string
  label_de?: string
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
  label_en?: string
  label_de?: string
  sort_order?: number
  description?: string
  options: FilterOption[]
}

export interface HeroSample {
  id: string
  before: string
  after: string
  category: string
  label: string
}
