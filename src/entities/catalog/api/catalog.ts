'use client'

import { api, apiUpload } from '@shared/api'
import type { FilterCategory, FilterOption } from '@entities/catalog/types'

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

export interface PhotoCatalogResponse {
  categories: FilterCategory[]
}

export async function fetchPhotoCatalog(): Promise<PhotoCatalogResponse> {
  const raw = await api<BackPhotoCatalog>('/api/v1/catalog/photo')
  return { categories: (raw.categories ?? []).map(mapCategory) }
}

const CATALOG_TTL_MS = 5 * 60 * 1000
let catalogCache: { data: PhotoCatalogResponse; at: number } | null = null
let catalogInFlight: Promise<PhotoCatalogResponse> | null = null

// getPhotoCatalogCached dedupes concurrent calls and caches the (static between
// deploys) catalog for a few minutes, so the home and generate screens share a
// single network request instead of each refetching.
export function getPhotoCatalogCached(): Promise<PhotoCatalogResponse> {
  const now = Date.now()
  if (catalogCache && now - catalogCache.at < CATALOG_TTL_MS) {
    return Promise.resolve(catalogCache.data)
  }
  if (catalogInFlight) return catalogInFlight
  catalogInFlight = fetchPhotoCatalog()
    .then((data) => {
      catalogCache = { data, at: Date.now() }
      return data
    })
    .finally(() => {
      catalogInFlight = null
    })
  return catalogInFlight
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

export interface UploadResponse {
  url: string
}

export async function uploadImage(file: File): Promise<UploadResponse> {
  const fd = new FormData()
  fd.append('file', file)
  const r = await apiUpload<BackAssetResponse>('/api/v1/admin/catalog/assets', fd)
  return { url: r.public_url }
}
