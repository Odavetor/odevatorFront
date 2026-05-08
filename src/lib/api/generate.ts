'use client'

import { api, apiUpload } from '../api-client'
import type {
  BackUploadResponse,
  PollGenerationResponse,
  StartGenerationResponse,
  StartPhotoGenerationRequest,
  StartVideoGenerationRequest,
  UploadResponse,
} from './types'

// Public upload — пользователь загружает свой исходник, получает URL для последующего job-init.
// Бэк: POST /api/v1/uploads (multipart/form-data, поле "file"), Bearer JWT.
// Ответ бэка: {public_url, sha256, size_bytes} → мапим в {url}.
export async function uploadUserPhoto(file: File): Promise<UploadResponse> {
  const fd = new FormData()
  fd.append('file', file)
  const r = await apiUpload<BackUploadResponse>('/api/v1/uploads', fd)
  return { url: r.public_url }
}

// Старт фото-генерации с фильтрами.
// Бэк: POST /api/v1/generate/photo. См. TZ §13.
export function startPhotoGeneration(payload: StartPhotoGenerationRequest): Promise<StartGenerationResponse> {
  return api<StartGenerationResponse>('/api/v1/generate/photo', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// Старт видео-генерации.
// Бэк: POST /api/v1/generate/video. См. TZ §13.
export function startVideoGeneration(payload: StartVideoGenerationRequest): Promise<StartGenerationResponse> {
  return api<StartGenerationResponse>('/api/v1/generate/video', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// Опрос статуса. Бэк long-poll'ит до max_wait_seconds.
// GET /api/v1/generate/{uid}?wait=true&max_wait_seconds=120
export function pollGeneration(uid: string, opts: { wait?: boolean; maxWaitSeconds?: number } = {}): Promise<PollGenerationResponse> {
  const qs = new URLSearchParams()
  if (opts.wait) qs.set('wait', 'true')
  if (opts.maxWaitSeconds) qs.set('max_wait_seconds', String(opts.maxWaitSeconds))
  const tail = qs.toString() ? `?${qs.toString()}` : ''
  return api<PollGenerationResponse>(`/api/v1/generate/${encodeURIComponent(uid)}${tail}`)
}
