'use client'

import { api, apiUpload } from './api-client'
import type { FilterCategory, FilterOption, VideoScenario } from '@/data/generate-options'

// ===== READ (public) =====

export interface PhotoCatalogResponse {
  categories: FilterCategory[]
}

export interface VideoCatalogResponse {
  scenarios: VideoScenario[]
}

export function fetchPhotoCatalog(): Promise<PhotoCatalogResponse> {
  return api<PhotoCatalogResponse>('/api/v1/catalog/photo')
}

export function fetchVideoCatalog(): Promise<VideoCatalogResponse> {
  return api<VideoCatalogResponse>('/api/v1/catalog/video')
}

// ===== ADMIN: photo categories =====

export interface CreateCategoryPayload {
  slug: string
  label: string
  sort_order?: number
}
export interface UpdateCategoryPayload {
  label?: string
  sort_order?: number
}

export function createPhotoCategory(payload: CreateCategoryPayload): Promise<FilterCategory> {
  return api<FilterCategory>('/api/v1/admin/photo/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updatePhotoCategory(id: string, payload: UpdateCategoryPayload): Promise<FilterCategory> {
  return api<FilterCategory>(`/api/v1/admin/photo/categories/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deletePhotoCategory(id: string): Promise<void> {
  return api<void>(`/api/v1/admin/photo/categories/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

// ===== ADMIN: photo options =====

export interface CreateOptionPayload {
  slug: string
  label: string
  before_image_url: string
  after_image_url: string
  sort_order?: number
  // Параметры для AI-провайдера. Если не задано — бэк применит дефолты.
  prompt_text?: string
  ai_model_type?: 2 | 3
  width?: number
  height?: number
}
export interface UpdateOptionPayload {
  label?: string
  before_image_url?: string
  after_image_url?: string
  sort_order?: number
  prompt_text?: string
  ai_model_type?: 2 | 3
  width?: number
  height?: number
}

export function createPhotoOption(categoryId: string, payload: CreateOptionPayload): Promise<FilterOption> {
  return api<FilterOption>(
    `/api/v1/admin/photo/categories/${encodeURIComponent(categoryId)}/options`,
    { method: 'POST', body: JSON.stringify(payload) },
  )
}

export function updatePhotoOption(id: string, payload: UpdateOptionPayload): Promise<FilterOption> {
  return api<FilterOption>(`/api/v1/admin/photo/options/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deletePhotoOption(id: string): Promise<void> {
  return api<void>(`/api/v1/admin/photo/options/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

// ===== ADMIN: video scenarios =====

export interface CreateScenarioPayload {
  slug: string
  label: string
  description: string
  thumbnail: string
  durationSec: number
  slots: number
  sort_order?: number
}
export interface UpdateScenarioPayload {
  label?: string
  description?: string
  thumbnail?: string
  durationSec?: number
  slots?: number
  sort_order?: number
}

export function createVideoScenario(payload: CreateScenarioPayload): Promise<VideoScenario> {
  return api<VideoScenario>('/api/v1/admin/video/scenarios', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateVideoScenario(id: string, payload: UpdateScenarioPayload): Promise<VideoScenario> {
  return api<VideoScenario>(`/api/v1/admin/video/scenarios/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteVideoScenario(id: string): Promise<void> {
  return api<void>(`/api/v1/admin/video/scenarios/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

// ===== ADMIN: image upload =====

export interface UploadResponse {
  url: string
}

export function uploadImage(file: File): Promise<UploadResponse> {
  const fd = new FormData()
  fd.append('file', file)
  return apiUpload<UploadResponse>('/api/v1/admin/upload', fd)
}
