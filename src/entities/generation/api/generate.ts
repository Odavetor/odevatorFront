'use client'

import { api, apiUpload } from '@shared/api'
import type {
  BackUploadResponse,
  PollGenerationResponse,
  StartGenerationResponse,
  StartPhotoGenerationRequest,
  StartVideoGenerationRequest,
  UploadResponse,
} from '@shared/api'

export async function uploadUserPhoto(file: File): Promise<UploadResponse> {
  const fd = new FormData()
  fd.append('file', file)
  const r = await apiUpload<BackUploadResponse>('/api/v1/uploads', fd)
  return { url: r.public_url }
}

export function startPhotoGeneration(
  payload: StartPhotoGenerationRequest,
): Promise<StartGenerationResponse> {
  return api<StartGenerationResponse>('/api/v1/generate/photo', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function startVideoGeneration(
  payload: StartVideoGenerationRequest,
): Promise<StartGenerationResponse> {
  return api<StartGenerationResponse>('/api/v1/generate/video', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function pollGeneration(
  uid: string,
  opts: { wait?: boolean; maxWaitSeconds?: number } = {},
): Promise<PollGenerationResponse> {
  const qs = new URLSearchParams()
  if (opts.wait) qs.set('wait', 'true')
  if (opts.maxWaitSeconds) qs.set('max_wait_seconds', String(opts.maxWaitSeconds))
  const tail = qs.toString() ? `?${qs.toString()}` : ''
  return api<PollGenerationResponse>(`/api/v1/generate/${encodeURIComponent(uid)}${tail}`)
}
