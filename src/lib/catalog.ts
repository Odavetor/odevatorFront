'use client'

import { api, apiUpload } from './api-client'
import type { FilterCategory, FilterOption, VideoScenario } from '@/data/generate-options'

// ===== Бэк-shape (как реально приходит из Go) =====

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
}
interface BackPhotoCategory {
  id: number
  slug: string
  label: string
  sort_order: number
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

// ===== Маперы бэк → фронт =====

function mapOption(o: BackPhotoOption): FilterOption {
  return {
    id: o.slug,                  // фронт идентифицирует опцию по slug (генерация шлёт slug)
    numericId: o.id,             // нужен для админ PATCH /admin/catalog/photo/options/{id}
    label: o.label,
    beforeExample: o.before_image_url,
    afterExample: o.after_image_url,
    prompt_text: o.prompt_text,
    ai_model_type: (o.ai_model_type === 2 ? 2 : 3),
    width: o.width,
    height: o.height,
    sort_order: o.sort_order,
  }
}

function mapCategory(c: BackPhotoCategory): FilterCategory {
  return {
    id: c.slug,                  // используем slug как id, чтобы передавать в /generate/photo
    label: c.label,
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
  }
}

// ===== READ (public) =====

export interface PhotoCatalogResponse { categories: FilterCategory[] }
export interface VideoCatalogResponse { scenarios: VideoScenario[] }

export async function fetchPhotoCatalog(): Promise<PhotoCatalogResponse> {
  const raw = await api<BackPhotoCatalog>('/api/v1/catalog/photo')
  return { categories: (raw.categories ?? []).map(mapCategory) }
}

export async function fetchVideoCatalog(): Promise<VideoCatalogResponse> {
  const raw = await api<BackVideoCatalog>('/api/v1/catalog/video')
  return { scenarios: (raw.scenarios ?? []).map(mapScenario) }
}

// ===== ADMIN: photo option (PATCH полный объект — бэк не поддерживает partial) =====

export interface UpdateOptionPayload {
  label: string
  before_image_url: string
  after_image_url: string
  prompt_text: string
  ai_model_type: 2 | 3
  width: number
  height: number
  sort_order: number
}

export function updatePhotoOption(numericId: number, payload: UpdateOptionPayload): Promise<{ status: string }> {
  return api<{ status: string }>(
    `/api/v1/admin/catalog/photo/options/${numericId}`,
    { method: 'PATCH', body: JSON.stringify(payload) },
  )
}

// ===== ADMIN: video scenario (PATCH полный объект) =====

export interface UpdateScenarioPayload {
  label: string
  description: string
  prompt_text: string
  thumbnail_url: string
  duration_sec: number
  slots: number
  sort_order: number
}

export function updateVideoScenario(numericId: number, payload: UpdateScenarioPayload): Promise<{ status: string }> {
  return api<{ status: string }>(
    `/api/v1/admin/catalog/video/scenarios/${numericId}`,
    { method: 'PATCH', body: JSON.stringify(payload) },
  )
}

// ===== ADMIN: upload (бэк отдаёт {id, public_url, sha256, size_bytes}) =====

export interface UploadResponse { url: string }

export async function uploadImage(file: File): Promise<UploadResponse> {
  const fd = new FormData()
  fd.append('file', file)
  const r = await apiUpload<BackAssetResponse>('/api/v1/admin/catalog/assets', fd)
  return { url: r.public_url }
}
