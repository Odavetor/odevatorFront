'use client'

import { api, apiUpload } from '@shared/api'
import type {
  FilterCategory,
  FilterOption,
  VideoScenario,
} from '@entities/catalog/types'

interface BackPhotoOption {
  id: number
  category_id: number
  slug: string
  label: string
  before_image_url: string
  after_image_url: string
  prompt_text: string
  ai_model_type: number
  width: number
  height: number
  sort_order: number
  description?: string | null
  price_minor?: number | null
}
interface BackPhotoCategory {
  id: number
  slug: string
  label: string
  sort_order: number
  description?: string | null
  options: BackPhotoOption[]
}
interface BackPhotoCatalog {
  categories: BackPhotoCategory[]
}

interface BackVideoScenario {
  id: number
  slug: string
  label: string
  description: string
  prompt_text: string
  thumbnail_url: string
  duration_sec: number
  slots: number
  sort_order: number
  description_full?: string | null
  price_minor?: number | null
}
interface BackVideoCatalog {
  scenarios: BackVideoScenario[]
}

interface BackAssetResponse {
  id: number
  public_url: string
  sha256: string
  size_bytes: number
}

function mapOption(o: BackPhotoOption): FilterOption {
  return {
    id: o.slug,
    numericId: o.id,
    label: o.label,
    beforeExample: o.before_image_url,
    afterExample: o.after_image_url,
    prompt_text: o.prompt_text,
    ai_model_type: o.ai_model_type === 2 ? 2 : 3,
    width: o.width,
    height: o.height,
    sort_order: o.sort_order,
    description: o.description ?? '',
    price_minor: o.price_minor ?? null,
  }
}

function mapCategory(c: BackPhotoCategory): FilterCategory {
  return {
    id: c.slug,
    numericId: c.id,
    label: c.label,
    sort_order: c.sort_order,
    description: c.description ?? '',
    options: (c.options ?? []).map(mapOption),
  }
}

function mapScenario(s: BackVideoScenario): VideoScenario {
  return {
    id: s.slug,
    numericId: s.id,
    label: s.label,
    description: s.description,
    thumbnail: s.thumbnail_url,
    durationSec: s.duration_sec,
    slots: s.slots,
    prompt_text: s.prompt_text,
    sort_order: s.sort_order,
    description_full: s.description_full ?? '',
    price_minor: s.price_minor ?? null,
  }
}

export interface PhotoCatalogResponse {
  categories: FilterCategory[]
}
export interface VideoCatalogResponse {
  scenarios: VideoScenario[]
}

export async function fetchPhotoCatalog(): Promise<PhotoCatalogResponse> {
  const raw = await api<BackPhotoCatalog>('/api/v1/catalog/photo')
  return { categories: (raw.categories ?? []).map(mapCategory) }
}

export async function fetchVideoCatalog(): Promise<VideoCatalogResponse> {
  const raw = await api<BackVideoCatalog>('/api/v1/catalog/video')
  return { scenarios: (raw.scenarios ?? []).map(mapScenario) }
}

export interface CreateCategoryPayload {
  slug: string
  label: string
  sort_order?: number
  description?: string
}

export interface UpdateCategoryPayload {
  label?: string
  sort_order?: number
  description?: string
}

export function createPhotoCategory(payload: CreateCategoryPayload): Promise<{ id: number }> {
  return api<{ id: number }>('/api/v1/admin/catalog/photo', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updatePhotoCategory(
  id: number,
  payload: UpdateCategoryPayload,
): Promise<{ status: string }> {
  return api<{ status: string }>(`/api/v1/admin/catalog/photo/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deletePhotoCategory(id: number): Promise<{ status: string }> {
  return api<{ status: string }>(`/api/v1/admin/catalog/photo/${id}`, { method: 'DELETE' })
}

export interface UpdateOptionPayload {
  label: string
  before_image_url: string
  after_image_url: string
  prompt_text: string
  ai_model_type: 2 | 3
  width: number
  height: number
  sort_order: number
  description?: string
  price_minor?: number | null
}

export interface CreateOptionPayload extends UpdateOptionPayload {
  category_id: number
  slug: string
}

export function createPhotoOption(payload: CreateOptionPayload): Promise<{ id: number }> {
  return api<{ id: number }>('/api/v1/admin/catalog/photo/options', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updatePhotoOption(
  numericId: number,
  payload: UpdateOptionPayload,
): Promise<{ status: string }> {
  return api<{ status: string }>(`/api/v1/admin/catalog/photo/options/${numericId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deletePhotoOption(numericId: number): Promise<{ status: string }> {
  return api<{ status: string }>(`/api/v1/admin/catalog/photo/options/${numericId}`, {
    method: 'DELETE',
  })
}

export interface UpdateScenarioPayload {
  label: string
  description: string
  prompt_text: string
  thumbnail_url: string
  duration_sec: number
  slots: number
  sort_order: number
  description_full?: string
  price_minor?: number | null
}

export interface CreateScenarioPayload extends UpdateScenarioPayload {
  slug: string
}

export function createVideoScenario(payload: CreateScenarioPayload): Promise<{ id: number }> {
  return api<{ id: number }>('/api/v1/admin/catalog/video/scenarios', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateVideoScenario(
  numericId: number,
  payload: UpdateScenarioPayload,
): Promise<{ status: string }> {
  return api<{ status: string }>(`/api/v1/admin/catalog/video/scenarios/${numericId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteVideoScenario(numericId: number): Promise<{ status: string }> {
  return api<{ status: string }>(`/api/v1/admin/catalog/video/scenarios/${numericId}`, {
    method: 'DELETE',
  })
}

export interface UploadResponse {
  url: string
}

export async function uploadImage(file: File): Promise<UploadResponse> {
  const fd = new FormData()
  fd.append('file', file)
  const r = await apiUpload<BackAssetResponse>('/api/v1/admin/catalog/assets', fd)
  return { url: r.public_url }
}
